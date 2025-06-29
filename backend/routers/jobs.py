from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Job
from firestore_client import db
from services.job_service import JobService
from datetime import datetime

router = APIRouter(tags=["jobs"])


@router.get("/")
def list_jobs(
    status: Optional[str] = Query(None, description="Filter by job status"),
    department: Optional[str] = Query(
        None, description="Filter by department"),
    location: Optional[str] = Query(None, description="Filter by location"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    with_metrics: bool = Query(True, description="Include real-time metrics")
):
    """Get all jobs with optional filtering and real-time metrics"""
    try:
        if with_metrics:
            jobs = JobService.get_all_jobs_with_metrics()
        else:
            docs = db.collection("jobs").stream()
            jobs = [doc.to_dict() for doc in docs]

        # Apply filters
        if status:
            jobs = [job for job in jobs if job.get('status') == status]
        if department:
            jobs = [job for job in jobs if job.get('department') == department]
        if location:
            jobs = [job for job in jobs if job.get('location') == location]
        if priority:
            jobs = [job for job in jobs if job.get('priority') == priority]

        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching jobs: {str(e)}")


@router.post("/")
def create_job(job_data: dict, created_by: str = "system"):
    """Create a new job posting with workflow initialization"""
    try:
        result = JobService.create_job(job_data, created_by)
        if result['success']:
            return {
                "success": True,
                "job_id": result['job_id'],
                "message": "Job created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating job: {str(e)}")


@router.get("/{job_id}")
def get_job(job_id: str, with_metrics: bool = Query(True, description="Include real-time metrics")):
    """Get a specific job by ID with optional metrics"""
    try:
        if with_metrics:
            job = JobService.get_job_with_metrics(job_id)
        else:
            doc = db.collection("jobs").document(job_id).get()
            job = doc.to_dict() if doc.exists else None

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching job: {str(e)}")


@router.put("/{job_id}")
def update_job(job_id: str, updates: dict, updated_by: str = "system"):
    """Update a job posting"""
    try:
        result = JobService.update_job(job_id, updates, updated_by)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating job: {str(e)}")


@router.delete("/{job_id}")
def delete_job(job_id: str):
    """Delete a job posting"""
    try:
        doc = db.collection("jobs").document(job_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")

        db.collection("jobs").document(job_id).delete()
        return {"success": True, "message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting job: {str(e)}")


@router.get("/{job_id}/candidates")
def get_job_candidates(
    job_id: str,
    stage: Optional[str] = Query(
        None, description="Filter by recruitment stage")
):
    """Get all candidates for a specific job"""
    try:
        candidates = JobService.get_job_candidates(job_id, stage)
        return {
            "job_id": job_id,
            "stage_filter": stage,
            "candidates": candidates,
            "total_count": len(candidates)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting job candidates: {str(e)}")


@router.get("/{job_id}/pipeline")
def get_job_pipeline(job_id: str):
    """Get detailed recruitment pipeline for a job"""
    try:
        job = JobService.get_job_with_metrics(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "job_id": job_id,
            "job_title": job.get('title'),
            "pipeline": job.get('pipeline', {}),
            "metrics": {
                "applicants": job.get('applicants', 0),
                "shortlisted": job.get('shortlisted', 0),
                "interviewed": job.get('interviewed', 0),
                "stage_breakdown": job.get('stage_breakdown', {})
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting job pipeline: {str(e)}")


@router.post("/{job_id}/assign-recruiter")
def assign_recruiter_to_job(
    job_id: str,
    recruiter_id: str,
    assigned_by: str = "system"
):
    """Assign a recruiter to a job"""
    try:
        result = JobService.assign_recruiter(job_id, recruiter_id, assigned_by)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error assigning recruiter: {str(e)}")


@router.post("/{job_id}/set-hiring-manager")
def set_job_hiring_manager(
    job_id: str,
    manager_id: str,
    assigned_by: str = "system"
):
    """Set hiring manager for a job"""
    try:
        result = JobService.set_hiring_manager(job_id, manager_id, assigned_by)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error setting hiring manager: {str(e)}")


@router.post("/{job_id}/close")
def close_job_posting(
    job_id: str,
    reason: str,
    closed_by: str = "system"
):
    """Close a job posting"""
    try:
        result = JobService.close_job(job_id, reason, closed_by)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error closing job: {str(e)}")


@router.post("/{job_id}/reopen")
def reopen_job_posting(
    job_id: str,
    reopened_by: str = "system"
):
    """Reopen a closed job posting"""
    try:
        result = JobService.reopen_job(job_id, reopened_by)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error reopening job: {str(e)}")


@router.get("/analytics/summary")
def get_jobs_analytics():
    """Get comprehensive job analytics"""
    try:
        analytics = JobService.get_job_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting job analytics: {str(e)}")


@router.get("/analytics/performance")
def get_top_performing_jobs(limit: int = Query(10, description="Number of top jobs to return")):
    """Get top performing jobs by metrics"""
    try:
        analytics = JobService.get_job_analytics()
        top_jobs = analytics.get('top_performing_jobs', [])[:limit]
        return {
            "top_jobs": top_jobs,
            "metrics_explanation": {
                "performance_score": "Calculated based on shortlist rate (30%) and interview rate (70%)",
                "higher_is_better": True
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting top performing jobs: {str(e)}")


@router.get("/search/active")
def get_active_jobs():
    """Get all active job postings"""
    try:
        docs = db.collection("jobs").where("status", "==", "Active").stream()
        jobs = [doc.to_dict() for doc in docs]

        # Add real-time metrics
        for job in jobs:
            job_id = job.get('id')
            if job_id:
                metrics = JobService._calculate_job_metrics(job_id)
                job.update(metrics)

        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting active jobs: {str(e)}")


@router.get("/search/by-department")
def get_jobs_by_department(department: str):
    """Get all jobs in a specific department"""
    try:
        docs = db.collection("jobs").where(
            "department", "==", department).stream()
        jobs = [doc.to_dict() for doc in docs]

        # Calculate department metrics
        total_jobs = len(jobs)
        active_jobs = len(
            [job for job in jobs if job.get('status') == 'Active'])

        return {
            "department": department,
            "jobs": jobs,
            "metrics": {
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "closed_jobs": total_jobs - active_jobs
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting jobs by department: {str(e)}")
