from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import candidates, jobs, interviews, events, rooms, dashboard, ai, interview_reports, positions, workflow

app = FastAPI(
    title="HireMau API",
    description="Complete recruitment pipeline management system",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(candidates.router, prefix="/candidates",
                   tags=["candidates"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(interviews.router, prefix="/interviews",
                   tags=["interviews"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(interview_reports.router,
                   prefix="/interview-reports", tags=["interview-reports"])
app.include_router(positions.router, prefix="/positions", tags=["positions"])
app.include_router(workflow.router, prefix="/workflow", tags=["workflow"])


@app.get("/")
def read_root():
    return {
        "message": "Welcome to HireMau API",
        "version": "1.0.0",
        "features": [
            "Complete recruitment workflow management",
            "Candidate pipeline tracking",
            "Interview scheduling and management",
            "AI-powered candidate analysis",
            "Real-time dashboard analytics",
            "Stage-based workflow automation"
        ],
        "endpoints": {
            "candidates": "/candidates",
            "jobs": "/jobs",
            "interviews": "/interviews",
            "events": "/events",
            "rooms": "/rooms",
            "dashboard": "/dashboard",
            "ai": "/ai",
            "interview_reports": "/interview-reports",
            "positions": "/positions",
            "workflow": "/workflow",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "HireMau API"}


# Add test endpoint for workflow verification
@app.get("/test/workflow/{candidate_id}")
def test_workflow_endpoint(candidate_id: str):
    """Test endpoint to verify workflow is working"""
    try:
        from services.candidate_service import CandidateService
        from services.workflow_service import WorkflowService

        # Get candidate
        candidate = CandidateService.get_candidate(candidate_id)
        if not candidate:
            return {"error": "Candidate not found"}

        # Get available actions
        actions = WorkflowService.get_available_actions(candidate_id)

        return {
            "success": True,
            "candidate_id": candidate_id,
            "current_stage": candidate.get('currentStage'),
            "status": candidate.get('status'),
            "available_actions": [action.value for action in actions],
            "stage_history_count": len(candidate.get('stageHistory', [])),
            "last_action_date": candidate.get('lastActionDate')
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
