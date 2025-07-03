from fastapi import APIRouter, HTTPException, Query
from services.job_service import JobService
from models import JobCreate, JobUpdate

router = APIRouter(tags=["jobs"])


@router.get("/")
def api_list_jobs(
    status: str = Query(None),
    department: str = Query(None),
    location: str = Query(None),
    priority: str = Query(None)
):
    try:
        return JobService.list_jobs(status, department, location, priority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}")
def api_get_job(job_id: str):
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/")
def api_create_job(job: JobCreate):
    return JobService.create_job(job)


@router.put("/{job_id}")
def api_update_job(job_id: str, job: JobUpdate):
    return JobService.update_job(job_id, job)


@router.delete("/{job_id}")
def api_delete_job(job_id: str):
    return JobService.delete_job(job_id)
