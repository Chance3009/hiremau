import os
from typing import Optional, Tuple
import PyPDF2
import docx
from fastapi import UploadFile
from supabase import create_client, Client
import logging
import uuid
from io import BytesIO

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        try:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            if not url or not key:
                logger.warning(
                    "Supabase credentials not configured - storage will be disabled")
                self.supabase = None
                self.storage_enabled = False
            else:
                self.supabase: Client = create_client(url, key)
                self.storage_enabled = True
                self._ensure_buckets_exist()
        except Exception as e:
            logger.warning(f"Failed to initialize storage service: {str(e)}")
            self.supabase = None
            self.storage_enabled = False

    def _ensure_buckets_exist(self):
        """Ensure required storage buckets exist"""
        if not self.storage_enabled:
            return

        try:
            # List existing buckets
            buckets = self.supabase.storage.list_buckets()
            existing_bucket_names = [bucket.name for bucket in buckets]

            # Create buckets if they don't exist
            required_buckets = ["resume", "other-docs"]
            for bucket_name in required_buckets:
                if bucket_name not in existing_bucket_names:
                    try:
                        self.supabase.storage.create_bucket(
                            bucket_name, {"public": True})
                        logger.info(f"Created bucket: {bucket_name}")
                    except Exception as e:
                        logger.warning(
                            f"Could not create bucket {bucket_name}: {str(e)}")

        except Exception as e:
            logger.warning(f"Could not check/create buckets: {str(e)}")
            # Continue anyway - buckets might exist but we can't list them

    async def upload_resume(self, file: UploadFile, candidate_id: str) -> str:
        """Upload resume file directly to resume bucket"""
        if not self.storage_enabled:
            # Return a mock URL for testing
            logger.warning("Storage not enabled - returning mock URL")
            return f"https://mock-storage.com/resume/{candidate_id}_{file.filename}"

        try:
            # Read file content
            content = await file.read()

            # Generate unique filename without subfolder
            file_extension = os.path.splitext(
                file.filename)[1] if file.filename else '.pdf'
            unique_filename = f"{candidate_id}_{uuid.uuid4()}{file_extension}"

            # Upload directly to resume bucket (no subfolder)
            result = self.supabase.storage.from_("resume").upload(
                unique_filename,
                content,
                file_options={"content-type": file.content_type}
            )

            # Check if upload was successful
            if hasattr(result, 'error') and result.error:
                raise Exception(f"Upload failed: {result.error}")

            # Get public URL
            public_url = self.supabase.storage.from_(
                "resume").get_public_url(unique_filename)

            logger.info(
                f"Resume uploaded successfully for candidate {candidate_id}: {public_url}")
            return public_url

        except Exception as e:
            logger.error(f"Error uploading resume: {str(e)}")
            # Return a mock URL as fallback
            return f"https://mock-storage.com/resume/{candidate_id}_{file.filename}"

    async def upload_supporting_doc(self, file: UploadFile, candidate_id: str) -> str:
        """Upload supporting documents to other-docs bucket"""
        if not self.storage_enabled:
            # Return a mock URL for testing
            logger.warning("Storage not enabled - returning mock URL")
            return f"https://mock-storage.com/docs/{candidate_id}_{file.filename}"

        try:
            # Read file content
            content = await file.read()

            # Generate unique filename without subfolder
            file_extension = os.path.splitext(
                file.filename)[1] if file.filename else '.pdf'
            unique_filename = f"{candidate_id}_{uuid.uuid4()}{file_extension}"

            # Upload directly to other-docs bucket
            result = self.supabase.storage.from_("other-docs").upload(
                unique_filename,
                content,
                file_options={"content-type": file.content_type}
            )

            # Check if upload was successful
            if hasattr(result, 'error') and result.error:
                raise Exception(f"Upload failed: {result.error}")

            # Get public URL
            public_url = self.supabase.storage.from_(
                "other-docs").get_public_url(unique_filename)

            logger.info(
                f"Document uploaded successfully for candidate {candidate_id}: {public_url}")
            return public_url

        except Exception as e:
            logger.error(f"Error uploading document: {str(e)}")
            # Return a mock URL as fallback
            return f"https://mock-storage.com/docs/{candidate_id}_{file.filename}"

    async def upload_other_document(self, file: UploadFile, candidate_id: str) -> str:
        """Upload other documents to other-docs bucket"""
        return await self.upload_supporting_doc(file, candidate_id)

    async def store_resume(self, file, candidate_id: str) -> Tuple[str, str]:
        """Store resume file and return file URL and extracted text"""
        try:
            # Upload file and get URL
            file_url = await self.upload_resume(file, candidate_id)

            # Extract text from file
            content = await file.read()
            extracted_text = await self._extract_text(content, file.filename or "resume.pdf")

            return file_url, extracted_text
        except Exception as e:
            logger.error(f"Error storing resume: {str(e)}")
            return "", ""

    async def update_file_candidate_id(self, old_id: str, new_id: str) -> None:
        """Update the candidate ID for a file"""
        # No-op since file handling is optional
        pass

    async def _extract_text(self, content: bytes, filename: str) -> str:
        """Extract text content from resume file"""
        try:
            file_ext = os.path.splitext(filename)[1].lower()

            if file_ext == '.pdf':
                # Extract text from PDF
                pdf_reader = PyPDF2.PdfReader(BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text

            elif file_ext in ['.doc', '.docx']:
                # Extract text from Word document
                doc = docx.Document(BytesIO(content))
                return "\n".join([paragraph.text for paragraph in doc.paragraphs])

            else:
                raise Exception(f"Unsupported file type: {file_ext}")

        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return ""

    async def get_resume_text(self, candidate_id: str) -> Optional[str]:
        """Get extracted text from candidate's resume"""
        try:
            result = self.supabase.table("candidate_files")\
                .select("extracted_text")\
                .eq("candidate_id", candidate_id)\
                .eq("file_type", "resume")\
                .single()\
                .execute()

            return result.data.get("extracted_text") if result.data else None

        except Exception as e:
            logger.error(f"Error getting resume text: {str(e)}")
            return None


storage_service = StorageService()
