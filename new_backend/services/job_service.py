import os
from supabase import create_client
from dotenv import load_dotenv
from models import JobCreate, JobUpdate

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class JobService:
    @staticmethod
    def list_jobs(status=None, department=None, location=None, priority=None):
        query = supabase.table("jobs").select("*")
        if status:
            query = query.eq("status", status)
        if department:
            query = query.eq("department", department)
        if location:
            query = query.eq("location", location)
        if priority:
            query = query.eq("priority", priority)
        response = query.execute()
        return response.data

    @staticmethod
    def get_all_jobs():
        """Get all jobs for dashboard overview"""
        response = supabase.table("jobs").select("*").execute()
        return response.data

    @staticmethod
    def get_all_jobs_with_metrics():
        """Get all jobs with candidate metrics for dashboard"""
        response = supabase.table("jobs").select("*").execute()
        jobs = response.data

        # Add mock metrics for now (in real implementation, this would join with candidates table)
        for job in jobs:
            job["applicants"] = 0  # Mock data
        return jobs

    @staticmethod
    def get_job(job_id):
        response = supabase.table("jobs").select(
            "*").eq("id", job_id).single().execute()
        return response.data

    @staticmethod
    def create_job(job: JobCreate):
        response = supabase.table("jobs").insert(job.dict()).execute()
        return {"success": True, "job_id": response.data[0]["id"]}

    @staticmethod
    def update_job(job_id, job: JobUpdate):
        response = supabase.table("jobs").update(
            job.dict(exclude_unset=True)).eq("id", job_id).execute()
        return {"success": True}

    @staticmethod
    def delete_job(job_id):
        supabase.table("jobs").delete().eq("id", job_id).execute()
        return {"success": True}
