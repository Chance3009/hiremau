from fastapi import APIRouter, HTTPException
from typing import List
from models import InterviewReport
from firestore_client import db

router = APIRouter(tags=["interview_reports"])


@router.get("/", response_model=List[InterviewReport])
def list_interview_reports():
    """Get all interview reports"""
    docs = db.collection("interview_reports").stream()
    return [doc.to_dict() for doc in docs]


@router.post("/", response_model=InterviewReport)
def create_interview_report(report: InterviewReport):
    """Create a new interview report"""
    db.collection("interview_reports").document(report.id).set(report.dict())
    return report


@router.get("/{report_id}", response_model=InterviewReport)
def get_interview_report(report_id: str):
    """Get a specific interview report by ID"""
    doc = db.collection("interview_reports").document(report_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=404, detail="Interview report not found")
    return doc.to_dict()


@router.put("/{report_id}", response_model=InterviewReport)
def update_interview_report(report_id: str, report: InterviewReport):
    """Update an existing interview report"""
    db.collection("interview_reports").document(report_id).set(report.dict())
    return report


@router.delete("/{report_id}")
def delete_interview_report(report_id: str):
    """Delete an interview report"""
    db.collection("interview_reports").document(report_id).delete()
    return {"message": "Interview report deleted"}


@router.get("/candidate/{candidate_id}", response_model=List[InterviewReport])
def get_reports_by_candidate(candidate_id: str):
    """Get all interview reports for a specific candidate"""
    docs = db.collection("interview_reports").where(
        "candidateId", "==", candidate_id).stream()
    return [doc.to_dict() for doc in docs]


@router.get("/interview/{interview_id}", response_model=InterviewReport)
def get_report_by_interview(interview_id: str):
    """Get interview report for a specific interview"""
    docs = db.collection("interview_reports").where(
        "interviewId", "==", interview_id).limit(1).stream()
    results = [doc.to_dict() for doc in docs]
    if not results:
        raise HTTPException(
            status_code=404, detail="Interview report not found for this interview")
    return results[0]
