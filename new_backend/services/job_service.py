import os
from supabase import create_client
from dotenv import load_dotenv
from models import JobCreate, JobUpdate
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from .base import BaseService
from models import Job, JobStatus
import logging

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

logger = logging.getLogger(__name__)


class JobService(BaseService):
    """Service for managing job openings"""

    async def get_jobs(self, filters: Dict = None) -> List[Job]:
        """Get all jobs with optional filters"""
        try:
            query = "SELECT * FROM jobs"
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(f"{key} = '{value}'")
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            query += " ORDER BY created_at DESC"

            result = await self.supabase.query(query).execute()
            return [Job(**job) for job in result.data]
        except Exception as e:
            print(f"Error getting jobs: {str(e)}")
            raise

    async def get_job_by_id(self, job_id: str) -> Optional[Job]:
        """Get a specific job by ID"""
        try:
            result = await self.supabase.query(
                f"SELECT * FROM jobs WHERE id = '{job_id}'"
            ).execute()
            return Job(**result.data[0]) if result.data else None
        except Exception as e:
            print(f"Error getting job by ID: {str(e)}")
            raise

    async def create_job(self, job: JobCreate) -> Job:
        """Create a new job"""
        try:
            result = await self.supabase.query(
                """
                INSERT INTO jobs (
                    title, department, location, type, experience,
                    salary, status, description, requirements
                ) VALUES (
                    :title, :department, :location, :type, :experience,
                    :salary, :status, :description, :requirements
                ) RETURNING *
                """,
                values=job.dict()
            ).execute()
            return Job(**result.data[0])
        except Exception as e:
            print(f"Error creating job: {str(e)}")
            raise

    async def update_job(self, job_id: str, job: JobUpdate) -> Optional[Job]:
        """Update an existing job"""
        try:
            # First check if job exists
            existing_job = await self.get_job_by_id(job_id)
            if not existing_job:
                return None

            # Update job
            update_data = job.dict(exclude_unset=True)
            if not update_data:
                return existing_job

            set_clauses = []
            for key, value in update_data.items():
                if isinstance(value, str):
                    set_clauses.append(f"{key} = '{value}'")
                else:
                    set_clauses.append(f"{key} = {value}")

            query = f"""
                UPDATE jobs
                SET {', '.join(set_clauses)}
                WHERE id = '{job_id}'
                RETURNING *
            """
            result = await self.supabase.query(query).execute()
            return Job(**result.data[0])
        except Exception as e:
            print(f"Error updating job: {str(e)}")
            raise

    async def delete_job(self, job_id: str) -> bool:
        """Delete a job"""
        try:
            # First check if job exists
            existing_job = await self.get_job_by_id(job_id)
            if not existing_job:
                return False

            # Delete job
            await self.supabase.query(
                f"DELETE FROM jobs WHERE id = '{job_id}'"
            ).execute()
            return True
        except Exception as e:
            print(f"Error deleting job: {str(e)}")
            raise

    async def get_job_metrics(self, job_id: str) -> Optional[Dict]:
        """Get metrics for a specific job"""
        try:
            # First check if job exists
            existing_job = await self.get_job_by_id(job_id)
            if not existing_job:
                return None

            # Get metrics
            result = await self.supabase.query(
                f"""
                SELECT
                    j.id,
                    j.title,
                    COUNT(DISTINCT ja.id) as total_applications,
                    COUNT(DISTINCT CASE WHEN ja.stage = 'shortlisted' THEN ja.id END) as shortlisted,
                    COUNT(DISTINCT CASE WHEN ja.stage = 'interviewed' THEN ja.id END) as interviewed,
                    COUNT(DISTINCT CASE WHEN ja.stage = 'offered' THEN ja.id END) as offered,
                    COUNT(DISTINCT CASE WHEN ja.stage = 'hired' THEN ja.id END) as hired
                FROM jobs j
                LEFT JOIN job_applications ja ON j.id = ja.job_id
                WHERE j.id = '{job_id}'
                GROUP BY j.id, j.title
                """
            ).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting job metrics: {str(e)}")
            raise

    async def get_job_applications(self, job_id: str) -> Optional[List[Dict]]:
        """Get all applications for a specific job"""
        try:
            # First check if job exists
            existing_job = await self.get_job_by_id(job_id)
            if not existing_job:
                return None

            # Get applications
            result = await self.supabase.query(
                f"""
                SELECT
                    ja.*,
                    c.name as candidate_name,
                    c.email as candidate_email
                FROM job_applications ja
                JOIN candidates c ON ja.candidate_id = c.id
                WHERE ja.job_id = '{job_id}'
                ORDER BY ja.created_at DESC
                """
            ).execute()
            return result.data
        except Exception as e:
            print(f"Error getting job applications: {str(e)}")
            raise

    def get_job(self, job_id: str) -> Dict[str, Any]:
        """Get a job by ID"""
        try:
            result = self.db.table("jobs").select(
                "*").eq("id", job_id).execute()

            if not result.data:
                raise HTTPException(status_code=404, detail="Job not found")

            return result.data[0]

        except Exception as e:
            logger.error(f"Error fetching job {job_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def update_job(self, job_id: str, job_data: JobUpdate) -> Dict[str, Any]:
        """Update a job"""
        try:
            # Convert to dict and add metadata
            update_dict = {k: v for k, v in job_data.dict().items()
                           if v is not None}
            update_dict["updated_at"] = datetime.utcnow().isoformat()

            # Update in database
            result = self.db.table("jobs").update(
                update_dict).eq("id", job_id).execute()

            if not result.data:
                raise HTTPException(status_code=404, detail="Job not found")

            return result.data[0]

        except Exception as e:
            logger.error(f"Error updating job {job_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def delete_job(self, job_id: str) -> Dict[str, Any]:
        """Delete a job"""
        try:
            # First check if there are any candidates linked to this job
            candidates = self.get_job_candidates(job_id)
            if candidates:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete job with linked candidates. Archive it instead."
                )

            result = self.db.table("jobs").delete().eq("id", job_id).execute()

            if not result.data:
                raise HTTPException(status_code=404, detail="Job not found")

            return {"message": "Job deleted successfully"}

        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error deleting job {job_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def list_jobs(
        self,
        status: Optional[JobStatus] = None,
        department: Optional[str] = None,
        location: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all jobs with optional filters"""
        try:
            query = self.db.table("jobs").select("*")

            # Apply filters
            if status:
                query = query.eq("status", status.value)
            if department:
                query = query.eq("department", department)
            if location:
                query = query.eq("location", location)

            result = query.execute()
            return result.data if result.data else []

        except Exception as e:
            logger.error(f"Error listing jobs: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_job_candidates(self, job_id: str) -> List[Dict[str, Any]]:
        """Get all candidates applied for a specific job"""
        try:
            # Get candidates through job_applications table
            result = self.db.table("job_applications")\
                .select("candidates(*)")\
                .eq("job_id", job_id)\
                .execute()

            # Extract candidate data from the nested structure
            candidates = [
                app["candidates"] for app in result.data
                if app and app.get("candidates")
            ]

            return candidates

        except Exception as e:
            logger.error(
                f"Error fetching candidates for job {job_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_job_metrics(self, job_id: str) -> Dict[str, Any]:
        """Get metrics for a specific job"""
        try:
            # Get job details
            job = self.get_job(job_id)

            # Get candidates by stage
            result = self.db.table("job_applications")\
                .select("candidates(stage)")\
                .eq("job_id", job_id)\
                .execute()

            # Count candidates in each stage
            stage_counts = {}
            for app in result.data:
                if app and app.get("candidates"):
                    stage = app["candidates"]["stage"]
                    stage_counts[stage] = stage_counts.get(stage, 0) + 1

            return {
                "total_applicants": job["applicants"],
                "shortlisted": job["shortlisted"],
                "interviewed": job["interviewed"],
                "stage_breakdown": stage_counts,
                "status": job["status"],
                "last_updated": job["updated_at"]
            }

        except Exception as e:
            logger.error(f"Error fetching metrics for job {job_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
