from flask_cors import CORS
import requests
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
import datetime
from typing import Optional

# LangChain and transformer imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
# from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings

# OCR/vision model import
# import ollama
from google import genai
from google.genai import types

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error(
        "SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")
    raise ValueError(
        "SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

transformer_model = "Qwen/Qwen3-Embedding-0.6B"
# ocr_model = "llava:13b"
ocr_model = "gemini-2.5-flash"
# embedding = HuggingFaceEmbeddings(model_name=transformer_model)
embedding = OllamaEmbeddings(model="nomic-embed-text")
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg'}

app = Flask(__name__)
CORS(app)

def extract_image_info(image_path: str) -> str:
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
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    response = client.models.generate_content(
        model=ocr_model,
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg',
            ),
            prompt
        ]
    )
    return str(response.text) if response.text else ""
    # response = ollama.chat(
    #     model=ocr_model,
    #     messages=[{
    #         "role": "user",
    #         "content": prompt,
    #         "images": [image_path]
    #     }],
    # )
    # return response['message']['content'].strip()


def add_candidate_document(name: Optional[str], url: Optional[str], uuid_str: Optional[str] = None) -> dict:
    if not url or not name:
        return {'error': 'Missing url or name'}
    try:
        r = requests.get(url)
        if r.status_code != 200:
            logger.error(f"Failed to download file from {url}")
            return {'error': 'Failed to download file'}

        # Clean the URL to remove query parameters before extracting extension
        clean_url = url.split('?')[0]  # Remove query parameters
        ext = os.path.splitext(clean_url)[1].lower() or '.bin'
        filename = f"{uuid_str}{ext}" if uuid_str else f"{name}{ext}"
        with open(filename, 'wb') as f:
            f.write(r.content)
        logger.info(f"Downloaded file saved as {filename} (uuid: {uuid_str})")

        # --- Process file: PDF ---
        if ext == '.pdf':
            loader = PyPDFLoader(filename)
            docs = loader.load()  # List[Document]
            logger.info(f"Loaded {len(docs)} PDF documents (all pages)")

            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embedding,
                client=supabase,
                table_name="candidate_table",
                query_name="match_documents",
                chunk_size=500,
                document_id=uuid_str,
                name=name,
            )
            logger.info(f"Stored {len(docs)} PDF chunks in candidate_table.")
            os.remove(filename)
        elif ext in IMAGE_EXTENSIONS:
            info = extract_image_info(filename)
            stat = os.stat(filename)
            creationdate = datetime.datetime.fromtimestamp(
                stat.st_ctime).isoformat()
            moddate = datetime.datetime.fromtimestamp(
                stat.st_mtime).isoformat()
            metadata = {
                "page": 1,
                "title": filename,
                "source": filename,
                "creator": "unknown",
                "moddate": moddate,
                "producer": ocr_model,
                "page_label": "1",
                "total_pages": 1,
                "creationdate": creationdate,
                "candidate_name": name,
                "file_type": "image",
                "document_id": uuid_str
            }
            image_doc = Document(page_content=info, metadata=metadata)
            docs = [image_doc]
            image_doc = Document(page_content=info, metadata=metadata)
            docs = [image_doc]
            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embedding,
                client=supabase,
                table_name="candidate_table",
                query_name="match_candidate_documents",
                chunk_size=500,
                document_id=uuid_str,
                name=name,
            )
            logger.info(f"Stored image OCR document in candidate_table.")
            os.remove(filename)
        else:
            logger.warning(f"Unsupported file type: {ext}")
            return {'error': f'Unsupported file type: {ext}'}
        return {'status': 'success', 'content': docs}
    except Exception as e:
        logger.error(f"Exception during download or processing: {e}")
        return {'error': str(e)}


def save_evaluation_to_supabase(
    candidate_id: str,
    candidate_name: str,
    position_applied: str,
    resume_summary: str,
    years_of_experience: float,
    education_background: str,
    career_progression: str,
    technical_skills: str,
    software_proficiency: str,
    industry_knowledge: str,
    soft_skills_claimed: str,
    certifications: str,
    technical_competency_assessment: str,
    experience_relevance: str,
    communication_assessment: str,
    standout_qualities: str,
    potential_concerns: str,
    strengths: str,
    weaknesses: str,
    red_flags: str,
    growth_potential: str,
    cultural_fit_indicators: str,
    missing_required_skills: str,
    transferable_skills: str,
    learning_curve_assessment: str,
    recommendation: str,
    recommendation_reasoning: str,
    interview_focus_areas: str
) -> dict:
    """
    Save candidate evaluation data to the initial_screening_evaluation table in Supabase.

    Returns:
        dict: Result of the operation with status and any error messages
    """
    try:
        # Create the evaluation data dictionary from individual arguments
        evaluation_data = {
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "position_applied": position_applied,
            "resume_summary": resume_summary,
            "years_of_experience": years_of_experience,
            "education_background": education_background,
            "career_progression": career_progression,
            "technical_skills": technical_skills,
            "software_proficiency": software_proficiency,
            "industry_knowledge": industry_knowledge,
            "soft_skills_claimed": soft_skills_claimed,
            "certifications": certifications,
            "technical_competency_assessment": technical_competency_assessment,
            "experience_relevance": experience_relevance,
            "communication_assessment": communication_assessment,
            "standout_qualities": standout_qualities,
            "potential_concerns": potential_concerns,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "red_flags": red_flags,
            "growth_potential": growth_potential,
            "cultural_fit_indicators": cultural_fit_indicators,
            "missing_required_skills": missing_required_skills,
            "transferable_skills": transferable_skills,
            "learning_curve_assessment": learning_curve_assessment,
            "recommendation": recommendation,
            "recommendation_reasoning": recommendation_reasoning,
            "interview_focus_areas": interview_focus_areas
        }

        # Insert the evaluation data into the initial_screening_evaluation table
        result = supabase.table('initial_screening_evaluation').insert(
            evaluation_data).execute()

        logger.info(
            f"Successfully saved evaluation for candidate: {candidate_name}")
        return {
            'status': 'success',
            'message': f"Evaluation saved for candidate {candidate_name}",
            'data': result.data
        }
    except Exception as e:
        logger.error(f"Error saving evaluation to Supabase: {e}")
        return {
            'status': 'error',
            'message': f"Failed to save evaluation: {str(e)}"
        }


def save_evaluation_to_rag(content: str, candidate_name: str):
    # Add metadata (timestamp, source, etc.)
    metadata = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "source": "evaluation",
        "candidate_name": candidate_name
    }
    doc = Document(page_content=content, metadata=metadata)
    # Store in Supabase candidate_rag table
    vector_store = SupabaseVectorStore.from_documents(
        [doc],
        embedding,
        client=supabase,
        table_name="candidate_rag",
        query_name="match_documents",
        chunk_size=500,
    )
    logger.info("Saved evaluation to candidate_rag table.")
