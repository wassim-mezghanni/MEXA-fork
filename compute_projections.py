"""
Compute 2D and 3D projections (PCA + t-SNE) of language embeddings per layer.
Outputs a JSON file for the dashboard's EmbeddingProjection component.

Usage:
    python compute_projections.py \
        --embedding_path ./embeddings \
        --output_json ./dashboard/public/data/projections-llama3.1-8b.json \
        --embedding_type embd_weighted \
        --num_sents 100 \
        --file_ext .pkl
"""

import os
import json
import pickle
import argparse
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE


def load_embeddings(embedding_path, file_ext, embedding_type, num_sents):
    """Load embeddings and compute mean sentence embedding per language per layer."""
    languages = []
    layer_embeddings = {}  # {layer_idx: {lang: mean_embedding}}

    files = sorted([f for f in os.listdir(embedding_path) if f.endswith(file_ext)])

    for filename in files:
        lang = filename[:-len(file_ext)]
        filepath = os.path.join(embedding_path, filename)

        with open(filepath, "rb") as f:
            lang_embd = pickle.load(f)

        languages.append(lang)

        for layer_idx, sentences in lang_embd.items():
            if layer_idx not in layer_embeddings:
                layer_embeddings[layer_idx] = {}

            vecs = [s[embedding_type] for s in sentences[:num_sents]]
            mean_vec = np.mean(vecs, axis=0).astype(np.float64)
            layer_embeddings[layer_idx][lang] = mean_vec

    return languages, layer_embeddings


def compute_projections(languages, layer_embeddings, perplexity=30, pca_seed=42, tsne_seed=42):
    """Compute PCA and t-SNE projections (2D + 3D) for each layer."""
    result = {}
    num_layers = len(layer_embeddings)

    for layer_idx in sorted(layer_embeddings.keys()):
        matrix = np.array([layer_embeddings[layer_idx][lang] for lang in languages])
        effective_perplexity = min(perplexity, len(languages) - 1)

        # 2D projections
        pca2 = PCA(n_components=2, random_state=pca_seed)
        pca_2d = pca2.fit_transform(matrix)
        pca2_var = pca2.explained_variance_ratio_.tolist()

        tsne2 = TSNE(n_components=2, perplexity=effective_perplexity, random_state=tsne_seed, max_iter=1000)
        tsne_2d = tsne2.fit_transform(matrix)

        # 3D projections
        pca3 = PCA(n_components=3, random_state=pca_seed)
        pca_3d = pca3.fit_transform(matrix)
        pca3_var = pca3.explained_variance_ratio_.tolist()

        tsne3 = TSNE(n_components=3, perplexity=effective_perplexity, random_state=tsne_seed, max_iter=1000)
        tsne_3d = tsne3.fit_transform(matrix)

        layer_data = {}
        for i, lang in enumerate(languages):
            layer_data[lang] = {
                "pca": [round(float(pca_2d[i][0]), 4), round(float(pca_2d[i][1]), 4)],
                "tsne": [round(float(tsne_2d[i][0]), 4), round(float(tsne_2d[i][1]), 4)],
                "pca3d": [round(float(pca_3d[i][j]), 4) for j in range(3)],
                "tsne3d": [round(float(tsne_3d[i][j]), 4) for j in range(3)],
            }

        result[int(layer_idx)] = {
            "points": layer_data,
            "pca_variance": [round(v, 4) for v in pca2_var],
            "pca3d_variance": [round(v, 4) for v in pca3_var],
        }

        total_var_2d = sum(pca2_var)
        total_var_3d = sum(pca3_var)
        print(f"  Layer {layer_idx}/{num_layers - 1} done (PCA 2D: {total_var_2d:.1%}, 3D: {total_var_3d:.1%})")

    return result


def main():
    parser = argparse.ArgumentParser(description="Compute 2D/3D projections of embeddings for dashboard visualization")
    parser.add_argument('--embedding_path', type=str, required=True, help='Directory containing .pkl embedding files')
    parser.add_argument('--output_json', type=str, required=True, help='Output JSON path for the dashboard')
    parser.add_argument('--embedding_type', type=str, default='embd_weighted', choices=['embd_weighted', 'embd_lasttoken'])
    parser.add_argument('--num_sents', type=int, default=100, help='Max sentences to average over')
    parser.add_argument('--file_ext', type=str, default='.pkl')
    parser.add_argument('--perplexity', type=int, default=30, help='t-SNE perplexity')
    args = parser.parse_args()

    print(f"Loading embeddings from {args.embedding_path}...")
    languages, layer_embeddings = load_embeddings(
        args.embedding_path, args.file_ext, args.embedding_type, args.num_sents
    )
    print(f"Loaded {len(languages)} languages, {len(layer_embeddings)} layers")

    print("Computing projections (2D + 3D)...")
    projections = compute_projections(languages, layer_embeddings, perplexity=args.perplexity)

    output = {
        "languages": languages,
        "num_layers": len(layer_embeddings),
        "layers": projections,
    }

    os.makedirs(os.path.dirname(args.output_json), exist_ok=True)
    with open(args.output_json, "w") as f:
        json.dump(output, f)

    print(f"Saved projections to {args.output_json}")


if __name__ == "__main__":
    main()
