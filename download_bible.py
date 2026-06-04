"""
Download the Bible (sPBC) parallel dataset from Hugging Face.

The sPBC dataset contains 1,401 language-script labels with 103 parallel
sentences (Bible verses) each. It is used as one of two parallel datasets
in the MEXA paper (ACL 2025 Findings).

Usage:
    python download_bible.py [--output_dir ./bible_dataset/103]

Source: https://huggingface.co/datasets/cis-lmu/sPBC
"""

import os
import argparse
import urllib.request
import zipfile
import shutil


def main():
    parser = argparse.ArgumentParser(
        description="Download and extract the Bible (sPBC) parallel dataset."
    )
    parser.add_argument(
        '--output_dir', type=str, default='./bible_dataset/103',
        help='Directory to save the extracted Bible text files (default: ./bible_dataset/103)'
    )
    parser.add_argument(
        '--url', type=str,
        default='https://huggingface.co/datasets/cis-lmu/sPBC/resolve/main/103.zip',
        help='URL to download the Bible zip file from'
    )
    parser.add_argument(
        '--token', type=str, default=None,
        help='Hugging Face token for authenticated downloads (or set HF_TOKEN env var)'
    )
    args = parser.parse_args()

    hf_token = args.token or os.environ.get('HF_TOKEN')

    zip_path = os.path.join(os.path.dirname(args.output_dir), '103.zip')

    # Download if not already present
    if not os.path.exists(zip_path):
        print(f"Downloading Bible (sPBC) dataset from:\n  {args.url}")
        os.makedirs(os.path.dirname(zip_path) or '.', exist_ok=True)
        req = urllib.request.Request(args.url)
        if hf_token:
            req.add_header('Authorization', f'Bearer {hf_token}')
        with urllib.request.urlopen(req) as response, open(zip_path, 'wb') as out:
            shutil.copyfileobj(response, out)
        print(f"Downloaded to {zip_path}")
    else:
        print(f"Zip file already exists: {zip_path}")

    # Extract
    if not os.path.exists(args.output_dir) or len(os.listdir(args.output_dir)) == 0:
        print(f"Extracting to {args.output_dir}...")
        os.makedirs(args.output_dir, exist_ok=True)

        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Extract to a temp dir first, then move files to output_dir
            temp_dir = args.output_dir + '_tmp'
            zf.extractall(temp_dir)

            # The zip may contain a nested directory — flatten if needed
            extracted_items = os.listdir(temp_dir)
            if len(extracted_items) == 1 and os.path.isdir(os.path.join(temp_dir, extracted_items[0])):
                # Nested directory — move contents up
                nested = os.path.join(temp_dir, extracted_items[0])
                for f in os.listdir(nested):
                    shutil.move(os.path.join(nested, f), os.path.join(args.output_dir, f))
                shutil.rmtree(temp_dir)
            else:
                # Files directly in temp — move them
                for f in extracted_items:
                    shutil.move(os.path.join(temp_dir, f), os.path.join(args.output_dir, f))
                shutil.rmtree(temp_dir)

        txt_count = len([f for f in os.listdir(args.output_dir) if f.endswith('.txt')])
        print(f"Extracted {txt_count} language files to {args.output_dir}")
    else:
        txt_count = len([f for f in os.listdir(args.output_dir) if f.endswith('.txt')])
        print(f"Dataset already extracted: {txt_count} files in {args.output_dir}")

    print("Done!")


if __name__ == "__main__":
    main()
