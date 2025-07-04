import os
from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores.supabase import SupabaseVectorStore

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error(
        "SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")
    raise ValueError(
        "SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Use the same embedding model as in company_rag.py
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# Instantiate SupabaseVectorStore for similarity search
vector_store = SupabaseVectorStore(
    embedding=embeddings,
    client=supabase,
    table_name="candidate_table",
    query_name="match_candidate_documents",
)


def similarity_search(query: str) -> List[str]:
    """
    Perform a semantic similarity search against the Supabase vector store.
    Args:
        query (str): The query string to search for.
        k (int): Number of top results to return.
    Returns:
        List[str]: List of page contents for the top matching chunks.
    """
    try:
        matched_docs = vector_store.similarity_search(query)
        return [doc.page_content for doc in matched_docs]
    except Exception as e:
        logger.error(f"Error during similarity search: {e}")
        return []
