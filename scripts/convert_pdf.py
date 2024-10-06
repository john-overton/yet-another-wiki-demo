import sys
from marker.convert import convert_single_pdf
from marker.models import load_all_models
from marker.output import save_markdown
import os

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_pdf.py <input_pdf_path> <output_directory>")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_dir = sys.argv[2]

    model_lst = load_all_models()
    full_text, images, out_meta = convert_single_pdf(input_pdf, model_lst)

    fname = os.path.basename(input_pdf)
    subfolder_path = save_markdown(output_dir, fname, full_text, images, out_meta)

    print(f"Saved markdown to: {subfolder_path}")

if __name__ == "__main__":
    main()