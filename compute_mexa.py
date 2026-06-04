import os
import json
import pickle
import numpy as np
from tqdm import tqdm
from scipy.spatial.distance import cosine
import argparse

def cosine_similarity(array1, array2):
    array1 = array1.astype(np.float64)
    array2 = array2.astype(np.float64)
    cosine_dist = cosine(array1, array2)
    cosine_similarity = 1 - cosine_dist
    return cosine_similarity

def mexa(matrix):
    n = len(matrix)  # size of the square matrix
    if n == 0:
        return 0.0
    diag = np.diag(matrix)
    temp = matrix.copy()
    np.fill_diagonal(temp, -np.inf)
    row_max = temp.max(axis=1)
    col_max = temp.max(axis=0)
    count = np.sum((diag > row_max) & (diag > col_max))
    return float(count / n)

def compute_distance(lang, embedding_type='embd_weighted', num_sents=100):
    with open(os.path.join(embedding_path, f"{lang}.pkl"), "rb") as pickle_file:
        lang_embd = pickle.load(pickle_file)    

    alignments = {}
    for layer in lang_embd.keys():
        pivot_embd_layer = pivot_embd[layer][:num_sents]
        lang_embd_layer = lang_embd[layer][:num_sents]
        
        num_actual_sentences = min(len(pivot_embd_layer), len(lang_embd_layer))
        if num_actual_sentences == 0:
            alignments[layer] = 0.0
            continue
            
        P = np.stack([x[embedding_type] for x in pivot_embd_layer[:num_actual_sentences]])
        L = np.stack([x[embedding_type] for x in lang_embd_layer[:num_actual_sentences]])
        
        # Vectorized cosine similarity: (P_norm @ L_norm.T)
        P_norm = P / (np.linalg.norm(P, axis=1, keepdims=True) + 1e-9)
        L_norm = L / (np.linalg.norm(L, axis=1, keepdims=True) + 1e-9)
        similarities = np.dot(P_norm, L_norm.T)
        
        alignments[layer] = mexa(similarities)
    
    return alignments

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process embeddings and compute alignments.')
    
    parser.add_argument('--pivot', type=str, default='eng_Latn', help='Pivot language code (default: eng_Latn)')
    parser.add_argument('--file_ext', type=str, default='.pkl', help='File extension for embedding files (default: .pkl)')
    parser.add_argument('--embedding_path', type=str, required=True, help='Path to the directory containing embedding files.')
    parser.add_argument('--save_path', type=str, required=True, help='Path to save the results.')
    parser.add_argument('--num_sents', type=int, default=100, help='Maximum number of sentences to process (default: 100)')
    parser.add_argument('--embedding_type', type=str, choices=['embd_weighted', 'embd_lasttoken'], default='embd_weighted', help='Type of embedding to use (default: embd_weighted)')

    args = parser.parse_args()

    # Set the global variables based on input arguments
    pivot = args.pivot
    file_ext = args.file_ext
    embedding_path = args.embedding_path
    save_path = args.save_path
    num_sents = args.num_sents
    embedding_type = args.embedding_type

    # Load the pivot embeddings
    with open(os.path.join(embedding_path, f"{pivot}{file_ext}"), "rb") as pickle_file:
        pivot_embd = pickle.load(pickle_file)

    languages = [filename[:-len(file_ext)] for filename in os.listdir(embedding_path) if filename.endswith(file_ext)]

    for lang in tqdm(languages):
        alignment_lang = compute_distance(lang, embedding_type=embedding_type, num_sents=num_sents)
        save_filepath = os.path.join(save_path, f"{lang}.json")
        os.makedirs(os.path.dirname(save_filepath), exist_ok=True)

        with open(save_filepath, "w") as json_file:
            json.dump(alignment_lang, json_file)
