from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from services.job_service import JobService
from models import Job, JobCreate, JobUpdate
from pydantic import BaseModel
from supabase_client import supabase
import logging
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["jobs"])
job_service = JobService()
logger = logging.getLogger(__name__)


class JobModel(BaseModel):
    id: str
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = None
    applicants: Optional[int] = None
    shortlisted: Optional[int] = None
    interviewed: Optional[int] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    company: Optional[str] = None
    job_type: Optional[str] = None
    salary_range: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    requirements: Optional[List[str]] = None


@router.get("/", response_model=List[JobModel])
async def get_jobs(
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all jobs with optional filtering"""
    try:
        # Build query
        query = supabase.table("jobs").select("*")

        # Apply filters
        if status:
            query = query.eq("status", status)
        if department:
            query = query.eq("department", department)
        if location:
            query = query.eq("location", location)

        # Apply limit and ordering
        query = query.limit(limit).order("created_at", desc=True)

        result = query.execute()

        jobs = result.data if result.data else []

        # Format jobs for Malaysian context
        formatted_jobs = []
        for job in jobs:
            formatted_job = {
                **job,
                "country": "Malaysia",
                "currency": "MYR",
                "timezone": "Asia/Kuala_Lumpur",
                "formatted_salary": job.get("salary_range", job.get("salary", "Negotiable")),
                "location": job.get("location", "Malaysia"),
                "company": job.get("company", "Your Company")
            }
            formatted_jobs.append(formatted_job)

        return formatted_jobs

    except Exception as e:
        logger.error(f"Error fetching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active/list")
async def get_active_jobs_list():
    """Get active jobs for form dropdowns - simplified format"""
    try:
        # Get only active jobs with essential fields
        result = supabase.table("jobs").select(
            "id, title, department, location, job_type, salary_range, company"
        ).eq("status", "active").order("title").execute()

        jobs = result.data if result.data else []

        # Format for dropdown usage
        formatted_jobs = []
        for job in jobs:
            formatted_job = {
                "id": job["id"],
                "title": job["title"],
                "department": job.get("department", ""),
                "location": job.get("location", "Malaysia"),
                "job_type": job.get("job_type", ""),
                "salary_range": job.get("salary_range", "Negotiable"),
                "company": job.get("company", "Your Company"),
                "display_name": f"{job['title']} - {job.get('department', '')} ({job.get('location', 'Malaysia')})"
            }
            formatted_jobs.append(formatted_job)

        logger.info(f"Retrieved {len(formatted_jobs)} active jobs for form")
        return formatted_jobs

    except Exception as e:
        logger.error(f"Error fetching active jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get a specific job by ID"""
    try:
        result = supabase.table("jobs").select(
            "*").eq("id", job_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Job not found")

        job = result.data

        # Format for Malaysian context
        formatted_job = {
            **job,
            "country": "Malaysia",
            "currency": "MYR",
            "timezone": "Asia/Kuala_Lumpur",
            "formatted_salary": job.get("salary_range", job.get("salary", "Negotiable")),
            "location": job.get("location", "Malaysia"),
            "company": job.get("company", "Your Company")
        }

        return formatted_job

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_job(job_data: Dict[str, Any]):
    """Create a new job"""
    try:
        # Add default values
        job_data["status"] = job_data.get("status", "active")
        job_data["company"] = job_data.get("company", "Your Company")
        job_data["applicants"] = 0
        job_data["shortlisted"] = 0
        job_data["interviewed"] = 0
        job_data["created_at"] = datetime.utcnow().isoformat()
        job_data["updated_at"] = datetime.utcnow().isoformat()

        result = supabase.table("jobs").insert(job_data).execute()

        if result.data:
            return {"success": True, "job": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create job")

    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{job_id}")
async def update_job(job_id: str, job_data: Dict[str, Any]):
    """Update a job"""
    try:
        job_data["updated_at"] = datetime.utcnow().isoformat()

        result = supabase.table("jobs").update(
            job_data).eq("id", job_id).execute()

        if result.data:
            return {"success": True, "job": result.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Job not found")

    except Exception as e:
        logger.error(f"Error updating job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    try:
        result = supabase.table("jobs").delete().eq("id", job_id).execute()

        if result.data:
            return {"success": True, "message": "Job deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Job not found")

    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}/metrics")
async def get_job_metrics(job_id: str):
    """Get metrics for a specific job"""
    try:
        metrics = await job_service.get_job_metrics(job_id)
        if not metrics:
            raise HTTPException(status_code=404, detail="Job not found")
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job metrics {job_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching job metrics: {str(e)}")


@router.get("/{job_id}/applications")
async def get_job_applications(job_id: str):
    """Get all applications for a specific job"""
    try:
        applications = await job_service.get_job_applications(job_id)
        if applications is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return applications
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job applications {job_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching job applications: {str(e)}")
