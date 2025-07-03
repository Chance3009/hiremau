import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# LangChain and embedding imports
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore

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

# Directory containing PDFs (same as this script)
data_path = os.path.dirname(os.path.abspath(__file__))
embedding_model = "nomic-embed-text"

# Initialize embedding model and text splitter
embeddings = OllamaEmbeddings(model=embedding_model)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

try:
    # Find all .pdf files in the current directory
    pdf_files = [f for f in os.listdir(data_path) if f.lower().endswith('.pdf')]
    if not pdf_files:
        logger.error(f"No PDF files found in {data_path}")
        exit(1)
    logger.info(f"Found {len(pdf_files)} PDF files: {pdf_files}")

    # Load all PDFs
    docs = []
    for pdf_file in pdf_files:
        loader = PyPDFLoader(os.path.join(data_path, pdf_file))
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
        table_name="company_table",
        query_name="match_company_documents",
        chunk_size=500,
    )

    # --- Delete PDF after processing (can comment out if needed) ---
    for pdf_file in pdf_files:
        try:
            os.remove(os.path.join(data_path, pdf_file))
            logger.info(f"Deleted PDF file: {pdf_file}")
        except Exception as e:
            logger.error(f"Failed to delete PDF file {pdf_file}: {e}")

    logger.info("All chunks and embeddings stored in Supabase.")
except Exception as e:
    logger.error(f"Error during PDF processing and upload: {e}")

