import argparse
import os
import torch
# Monkeypatch to avoid ImportError: cannot import name 'AuxRequest' from 'torch.nn.attention.flex_attention'
try:
    import torch.nn.attention.flex_attention
    if not hasattr(torch.nn.attention.flex_attention, 'AuxRequest'):
        torch.nn.attention.flex_attention.AuxRequest = object
except ImportError:
    pass

# Preemptively initialize CUDA to prevent context corruption during model loading
if torch.cuda.is_available():
    torch.cuda.init()
import json
import pickle
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModel
from tqdm import tqdm

# Function to handle weighted embeddings
def weighted_embeddings(layer, attention_mask, device='cuda'):
    # Compute weights for non-padding tokens
    weights_for_non_padding = attention_mask * torch.arange(start=1, end=layer.shape[1] + 1, device=device).unsqueeze(0)
    sum_embeddings = torch.sum(layer * weights_for_non_padding.unsqueeze(-1), dim=1)
    num_of_non_padding_tokens = torch.sum(weights_for_non_padding, dim=-1).unsqueeze(-1)
    sentence_embeddings = sum_embeddings / num_of_non_padding_tokens
    sentence_embeddings = sentence_embeddings.squeeze().to(torch.float32).cpu().numpy()
    return sentence_embeddings


def lasttoken_embeddings(layer, attention_mask, device='cuda'):
    # Compute the index of the last non-padding token
    idx_of_last_token = attention_mask.bool().sum().item() - 1  # scalar index
    # Extract the embedding from the layer
    embedding = layer[0, idx_of_last_token, :]  # shape: [hidden_dim]
    sentence_embedding = embedding.to(torch.float32).cpu().numpy()
    return sentence_embedding


# Function to extract embeddings
def get_embedding_layers(text, model, tokenizer, device='cuda'):
    tokens = tokenizer(text, return_tensors='pt', padding=True, truncation=True).to(device)
    attention_mask = tokens.attention_mask.to(device)

    sentence_embeddings_weighted = []
    sentence_embeddings_last_token = []
    
    with torch.no_grad():
        hidden_state_layers = model(**tokens, output_hidden_states=True)["hidden_states"]

        for layer in hidden_state_layers:
            embd_weighted = weighted_embeddings(layer, attention_mask, device)
            embd_last_token = lasttoken_embeddings(layer, attention_mask, device)

            sentence_embeddings_weighted.append(embd_weighted)
            sentence_embeddings_last_token.append(embd_last_token)

    return sentence_embeddings_weighted, sentence_embeddings_last_token

def get_device(gpus_arg):
    """Determine the device to use. If gpus_arg is 'cpu' or CUDA is unavailable, use CPU."""
    if gpus_arg == 'cpu' or not torch.cuda.is_available():
        print(f"Using device: cpu")
        return 'cpu'
    print(f"Using device: cuda")
    return 'cuda'

# Main function
def main():
    parser = argparse.ArgumentParser(description="Extract embeddings from a model")

    # Add arguments for the parser
    parser.add_argument('--model_name', type=str, required=True, help='The model name from Hugging Face.')
    parser.add_argument('--data_path', type=str, required=True, help='Path to the parallel data directory.')
    parser.add_argument('--gpus', type=str, default='0', help='GPUs to use, e.g. "0".')
    parser.add_argument('--num_sents', type=int, default=100, help='Maximum number of sentences to process.')
    parser.add_argument('--save_path', type=str, required=True, help='Path to save the embeddings.')
    parser.add_argument('--token', type=str, default=None, help='Hugging Face token (optional).')
    parser.add_argument('--cache_dir', type=str, default='./cache', help='Directory for caching the model (optional).')
    parser.add_argument('--file_ext', type=str, default='.txt', help='File extension for input files (optional, default: .txt).')
    parser.add_argument('--lang_list', type=str, default=None, help='Path to a JSON file containing a list of language codes to process.')
    parser.add_argument('--model_type', type=str, choices=['causal', 'encoder'], default='causal',
                        help='Architecture family of the model. Use "causal" for decoder-only LMs '
                             '(Llama, Qwen, Mistral, Apertus) loaded via AutoModelForCausalLM, and '
                             '"encoder" for bidirectional encoders (XLM-RoBERTa, LaBSE) loaded via AutoModel.')

    # Parse the arguments
    args = parser.parse_args()

    # Load language list if provided
    lang_filter = None
    if args.lang_list:
        with open(args.lang_list, 'r') as f:
            lang_filter = set(json.load(f))

    # Determine device
    device = get_device(args.gpus)

    # Define model name and token
    model_name = args.model_name
    # Treat an empty/whitespace token as "no token". Passing token="" makes
    # huggingface_hub send a malformed `Authorization: Bearer ` header, which
    # raises httpx LocalProtocolError — public models need no token at all.
    token = args.token.strip() if args.token and args.token.strip() else None

    # Load the model and tokenizer
    device_map = 'auto' if device == 'cuda' else 'cpu'
    if args.model_type == 'encoder':
        # Bidirectional encoders (XLM-RoBERTa, LaBSE) expose hidden states via AutoModel.
        model = AutoModel.from_pretrained(model_name, device_map=device_map, cache_dir=args.cache_dir, token=token, trust_remote_code=True)
    else:
        model = AutoModelForCausalLM.from_pretrained(model_name, device_map=device_map, cache_dir=args.cache_dir, token=token, trust_remote_code=True)
    model.eval()
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=token, trust_remote_code=True)
    except Exception as e:
        # Some SentencePiece models (e.g. Glot500) ship only sentencepiece.bpe.model
        # and their fast-tokenizer conversion fails on newer transformers. Fall back
        # to the slow tokenizer, which reads the SentencePiece model directly.
        print(f"Fast tokenizer load failed ({type(e).__name__}); retrying with use_fast=False.")
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=token, trust_remote_code=True, use_fast=False)
    # Encoders already define a dedicated pad token; only causal LMs need the eos fallback.
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Directory and number of sentences
    directory = args.data_path
    number_of_sents = args.num_sents

    # Initialize a dictionary to store embeddings
    result_dict = {}

    # Process the files in the directory
    for filename in os.listdir(directory):
        if filename.endswith(args.file_ext):
            language = filename.split('.')[0]
            
            # Filter by language list if provided
            if lang_filter and language not in lang_filter:
                continue

            filepath = os.path.join(directory, filename)
            
            sentences = []
            with open(filepath, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for idx, line in enumerate(lines):
                    if idx < number_of_sents:
                        sentence = line.strip()
                        sentences.append({'id': idx + 1, 'text': sentence})

            result_dict[language] = sentences

    # Prepare to save embeddings
    embeddings_dict = {}

    # Extract embeddings (skip already-processed languages for resume support)
    for language, texts in tqdm(result_dict.items()):
        save_filepath = os.path.join(args.save_path, f"{language}.pkl")
        if os.path.exists(save_filepath):
            continue  # Already computed, skip
        embeddings_dict = {}

        for text in texts:
            embds_weighted, embds_last_token = get_embedding_layers(text['text'], model, tokenizer, device)

            for layer in range(len(embds_weighted)):
                if layer not in embeddings_dict:
                    embeddings_dict[layer] = []

                embeddings_dict[layer].append({
                    'id': text['id'],
                    'embd_weighted': embds_weighted[layer],
                    'embd_lasttoken': embds_last_token[layer]
                })

        # Save the embeddings as pickle
        save_filepath = os.path.join(args.save_path, f"{language}.pkl")
        os.makedirs(os.path.dirname(save_filepath), exist_ok=True)
        with open(save_filepath, "wb") as pickle_file:
            pickle.dump(embeddings_dict, pickle_file)

if __name__ == "__main__":
    main()
