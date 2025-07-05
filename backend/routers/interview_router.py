from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from services.interview_service import InterviewService
from models import InterviewCreate, InterviewUpdate

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.post("/start/{candidate_id}")
async def start_interview(candidate_id: str, service: InterviewService = Depends()):
    """Start a new interview session"""
    return await service.start_interview(candidate_id)


@router.post("/{interview_id}/transcript")
async def update_transcript(interview_id: str, transcript_data: Dict, service: InterviewService = Depends()):
    """Update interview transcript"""
    return await service.update_transcript(interview_id, transcript_data)


@router.post("/{interview_id}/questions")
async def get_suggested_questions(
    interview_id: str,
    transcript: List[Dict],
    context: Dict,
    service: InterviewService = Depends()
):
    """Get AI-suggested questions"""
    return await service.get_suggested_questions(transcript, context)


@router.post("/{interview_id}/analyze")
async def analyze_response(
    interview_id: str,
    transcript: List[Dict],
    service: InterviewService = Depends()
):
    """Get real-time analysis of responses"""
    return await service.analyze_response(transcript)


@router.post("/{interview_id}/end")
async def end_interview(
    interview_id: str,
    summary: Dict,
    service: InterviewService = Depends()
):
    """End interview and save summary"""
    return await service.end_interview(interview_id, summary)
