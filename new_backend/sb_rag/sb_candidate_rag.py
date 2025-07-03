import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
import datetime

# LangChain and embedding imports
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document

# OCR/vision model import
import ollama

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- PDF Chunking and Embedding Logic ---

# Directory containing PDFs and images (same as this script)
data_path = os.path.dirname(os.path.abspath(__file__))
embedding_model = "nomic-embed-text"
ocr_model = "llava:13b"

# Initialize embedding model and text splitter
embeddings = OllamaEmbeddings(model=embedding_model)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Supported image extensions
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg'}

def extract_image_info(image_path: str) -> str:
    """
    Use the ocr_model to extract information from an image file using the same prompt as ocr_test.ipynb.
    """
    prompt = """
        Analyze this document and create a comprehensive summary of all information that could be relevant for candidate evaluation. The document type is unknown - it could be a resume, certificate, transcript, portfolio, cover letter, or any other candidate-related document.

        Write a detailed description that captures:

        **Document Type and Purpose**: Identify what type of document this appears to be and its purpose.

        **Key Information**: Extract and describe all factual information present, including:
        - Names, dates, organizations, institutions
        - Titles, positions, roles, achievements
        - Skills, qualifications, certifications, credentials
        - Education details, courses, programs
        - Performance metrics, scores, grades, ratings
        - Contact information and identifiers
        - Any other relevant details

        **Context and Significance**: Explain what this information suggests about the candidate's qualifications, experience, or background. Connect the dots between different pieces of information when possible.

        Write in clear, professional language using complete sentences. Include ALL available information, no matter how minor it might seem. Be specific about names, dates, numbers, and technical details. If information is unclear or ambiguous, describe what you can determine and note any uncertainties.

        The goal is to create a comprehensive record that preserves all potentially useful information for candidate assessment, regardless of the original document format.
    """
    response = ollama.chat(
        model=ocr_model,
        messages=[{
            "role": "user",
            "content": prompt,
            "images": [image_path]
        }],
    )
    return response['message']['content'].strip()

# Example usage for processing files in data_path
def process_files_in_directory(directory: str):
    try:
        # Find all .pdf files in the directory
        pdf_files = [f for f in os.listdir(directory) if f.lower().endswith('.pdf')]
        if not pdf_files:
            logger.warning(f"No PDF files found in {directory}")
        else:
            logger.info(f"Found {len(pdf_files)} PDF files: {pdf_files}")

            # Load all PDFs
            docs = []
            for pdf_file in pdf_files:
                loader = PyPDFLoader(os.path.join(directory, pdf_file))
                docs.extend(loader.load())
            logger.info(f"Loaded {len(docs)} PDF documents (all pages)")

            # Split documents into chunks
            chunks = text_splitter.split_documents(docs)
            logger.info(f"Split into {len(chunks)} chunks")

            # Embed and store each chunk text in Supabase
            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embeddings,
                client=supabase,
                table_name="candidate_table",
                query_name="match_documents",
                chunk_size=500,
            )

            # --- Delete PDF after processing (can comment out if needed) ---
            for pdf_file in pdf_files:
                try:
                    os.remove(os.path.join(directory, pdf_file))
                    logger.info(f"Deleted PDF file: {pdf_file}")
                except Exception as e:
                    logger.error(f"Failed to delete PDF file {pdf_file}: {e}")

        # Process images
        image_docs = []
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            ext = os.path.splitext(filename)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                logger.info(f"Processing image: {filename}")
                info = extract_image_info(file_path)
                stat = os.stat(file_path)
                # File times
                creationdate = datetime.datetime.fromtimestamp(stat.st_ctime).isoformat()
                moddate = datetime.datetime.fromtimestamp(stat.st_mtime).isoformat()
                metadata = {
                    "page": 1,
                    "title": filename,
                    "source": file_path,
                    "creator": "unknown",
                    "moddate": moddate,
                    "producer": ocr_model,
                    "page_label": "1",
                    "total_pages": 1,
                    "creationdate": creationdate
                }
                doc = Document(page_content=info, metadata=metadata)
                image_docs.append(doc)
                logger.info(f"Extracted info from {filename} and created Document with metadata.")
                # Delete image after processing
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted image file: {filename}")
                except Exception as e:
                    logger.error(f"Failed to delete image file {filename}: {e}")
            elif ext != '.pdf':
                logger.debug(f"Skipping unsupported file: {filename}")

        # Store image docs in Supabase if any
        if image_docs:
            vector_store = SupabaseVectorStore.from_documents(
                image_docs,
                embeddings,
                client=supabase,
                table_name="candidate_table",
                query_name="match_candidate_documents",
                chunk_size=500,
            )
            logger.info(f"Stored {len(image_docs)} image OCR documents in Supabase.")

        logger.info("All chunks and embeddings stored in Supabase.")
    except Exception as e:
        logger.error(f"Error during PDF/image processing and upload: {e}")


process_files_in_directory(data_path)