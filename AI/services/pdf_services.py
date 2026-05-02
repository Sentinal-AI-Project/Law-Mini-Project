import pdfplumber

def extract_text_from_pdf(file_bytes):
    text = ""

    with pdfplumber.open(file_bytes) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"

    return text