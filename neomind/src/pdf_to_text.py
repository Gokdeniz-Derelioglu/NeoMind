import fitz  # PyMuPDF
import sys

def pdf_to_text(path: str) -> str:
    """Extract all text from a PDF file using PyMuPDF."""
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <path-to-pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    text = pdf_to_text(pdf_path)
    print(text)

if __name__ == "__main__":
    main()
