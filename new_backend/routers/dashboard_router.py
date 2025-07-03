from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime, timedelta
from services.candidate_service import CandidateService
from services.job_service import JobService
from services.event_service import EventService
from services.interview_service import InterviewService

router = APIRouter(tags=["dashboard"])


@router.get("/overview")
def get_dashboard_overview():
    """Get comprehensive dashboard overview with real data"""
    try:
        # Get data from all services
        candidates = CandidateService.get_all_candidates()
        jobs = JobService.get_all_jobs()
        events = EventService.get_all_events()
        interviews = InterviewService.get_all_interviews()

        # Calculate candidate metrics by stage
        stage_counts = {}
        total_candidates = len(candidates)

        for candidate in candidates:
            stage = candidate.get("current_stage", "applied")
            stage_counts[stage] = stage_counts.get(stage, 0) + 1

        # Calculate job metrics
        active_jobs = sum(1 for job in jobs if job.get("status") == "Active")
        total_applicants = sum(job.get("applicants", 0) for job in jobs)

        # Calculate event metrics
        upcoming_events = []
        past_events = []
        total_registrations = 0

        for event in events:
            event_date = datetime.fromisoformat(
                event.get("date", "2024-01-01"))

            if event_date >= datetime.now():
                upcoming_events.append(event)
            else:
                past_events.append(event)

            total_registrations += event.get("registrations", 0)

        # Calculate interview metrics
        scheduled_interviews = sum(
            1 for interview in interviews if interview.get("status") == "scheduled")
        completed_interviews = sum(
            1 for interview in interviews if interview.get("status") == "completed")

        # Calculate conversion rates
        conversion_rates = {}
        stages = ["applied", "screened", "interviewed",
                  "final-review", "shortlisted"]

        for i in range(len(stages) - 1):
            current_stage = stages[i]
            next_stage = stages[i + 1]

            current_count = stage_counts.get(current_stage, 0)
            next_count = stage_counts.get(next_stage, 0)

            if current_count > 0:
                conversion_rate = (next_count / current_count) * 100
                conversion_rates[f"{current_stage}_to_{next_stage}"] = round(
                    conversion_rate, 2)

        return {
            "summary": {
                "totalCandidates": total_candidates,
                "activeJobs": active_jobs,
                "upcomingEvents": len(upcoming_events),
                "scheduledInterviews": scheduled_interviews,
                "totalRegistrations": total_registrations
            },
            "candidateMetrics": {
                "stageDistribution": stage_counts,
                "conversionRates": conversion_rates,
                "recentApplications": total_candidates  # Could be filtered by date
            },
            "jobMetrics": {
                "activeJobs": active_jobs,
                "totalApplicants": total_applicants,
                "avgApplicantsPerJob": round(total_applicants / max(len(jobs), 1), 1)
            },
            "eventMetrics": {
                "upcomingEvents": len(upcoming_events),
                "pastEvents": len(past_events),
                "totalRegistrations": total_registrations,
                "avgRegistrationsPerEvent": round(total_registrations / max(len(events), 1), 1)
            },
            "interviewMetrics": {
                "scheduled": scheduled_interviews,
                "completed": completed_interviews,
                "total": len(interviews),
                "completionRate": round((completed_interviews / max(len(interviews), 1)) * 100, 2)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard overview: {str(e)}")


@router.get("/events")
def get_dashboard_events():
    """Get all events with detailed information for dashboard"""
    try:
        events = EventService.get_events_with_candidates()

        # Sort events by date
        events.sort(key=lambda x: x.get("date", ""), reverse=True)

        # Calculate additional metrics
        upcoming_events = sum(1 for e in events if datetime.fromisoformat(
            e.get("date", "2024-01-01")) >= datetime.now())
        total_registrations = sum(e.get("registrations", 0) for e in events)
        total_candidates = sum(e.get("candidate_count", 0) for e in events)

        return {
            "events": events,
            "totalEvents": len(events),
            "upcomingEvents": upcoming_events,
            "totalRegistrations": total_registrations,
            "totalCandidates": total_candidates
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard events: {str(e)}")


@router.get("/jobs")
def get_dashboard_jobs():
    """Get all jobs with candidate metrics for dashboard"""
    try:
        jobs = JobService.get_all_jobs_with_metrics()

        # Calculate additional metrics
        active_jobs = sum(1 for job in jobs if job.get("status") == "Active")
        total_applicants = sum(job.get("applicants", 0) for job in jobs)

        return {
            "jobs": jobs,
            "totalJobs": len(jobs),
            "activeJobs": active_jobs,
            "totalApplicants": total_applicants,
            "avgApplicantsPerJob": round(total_applicants / max(len(jobs), 1), 1)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard jobs: {str(e)}")


@router.get("/recent-activity")
def get_recent_activity():
    """Get recent activity across all entities"""
    try:
        recent_activity = []

        # Get recent candidates
        candidates = CandidateService.get_all_candidates()
        for candidate in candidates[:10]:  # Last 10 candidates
            recent_activity.append({
                "type": "candidate",
                "action": "applied",
                "entity_id": candidate.get("id"),
                "entity_name": candidate.get("name"),
                "timestamp": candidate.get("created_at"),
                "details": f"Applied for position"
            })

        # Get recent interviews
        interviews = InterviewService.get_all_interviews()
        for interview in interviews[:10]:  # Last 10 interviews
            recent_activity.append({
                "type": "interview",
                "action": interview.get("status", "scheduled"),
                "entity_id": interview.get("id"),
                "entity_name": f"Interview for {interview.get('candidate_id', 'Unknown')}",
                "timestamp": interview.get("created_at"),
                "details": f"Interview {interview.get('type', 'technical')}"
            })

        # Get recent events
        events = EventService.get_all_events()
        for event in events[:5]:  # Last 5 events
            recent_activity.append({
                "type": "event",
                "action": "created",
                "entity_id": event.get("id"),
                "entity_name": event.get("name"),
                "timestamp": event.get("created_at"),
                "details": f"Event at {event.get('location', 'Unknown')}"
            })

        # Sort by timestamp (most recent first)
        recent_activity.sort(key=lambda x: x.get(
            "timestamp", ""), reverse=True)

        return {
            "recent_activity": recent_activity[:20],  # Return top 20
            "total_activities": len(recent_activity)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recent activity: {str(e)}")


@router.get("/analytics/pipeline")
def get_pipeline_analytics():
    """Get detailed pipeline analytics"""
    try:
        candidates = CandidateService.get_all_candidates()
        jobs = JobService.get_all_jobs()

        # Calculate pipeline metrics
        pipeline_data = {
            "total_candidates": len(candidates),
            "stage_breakdown": {},
            "conversion_rates": {},
            "time_in_stage": {},
            "bottlenecks": []
        }

        # Count candidates by stage
        stage_counts = {}
        for candidate in candidates:
            stage = candidate.get("current_stage", "applied")
            stage_counts[stage] = stage_counts.get(stage, 0) + 1

        pipeline_data["stage_breakdown"] = stage_counts

        # Calculate conversion rates
        stages = ["applied", "screened", "interviewed",
                  "final-review", "shortlisted", "hired"]
        for i in range(len(stages) - 1):
            current_stage = stages[i]
            next_stage = stages[i + 1]

            current_count = stage_counts.get(current_stage, 0)
            next_count = stage_counts.get(next_stage, 0)

            if current_count > 0:
                conversion_rate = (next_count / current_count) * 100
                pipeline_data["conversion_rates"][f"{current_stage}_to_{next_stage}"] = round(
                    conversion_rate, 2)

        # Identify bottlenecks (stages with low conversion rates)
        for stage_pair, rate in pipeline_data["conversion_rates"].items():
            if rate < 20:  # Less than 20% conversion rate
                pipeline_data["bottlenecks"].append({
                    "stage_pair": stage_pair,
                    "conversion_rate": rate,
                    "issue": "Low conversion rate"
                })

        return pipeline_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting pipeline analytics: {str(e)}")


@router.get("/metrics/recruitment-funnel")
def get_recruitment_funnel():
    """Get recruitment funnel metrics"""
    try:
        candidates = CandidateService.get_all_candidates()
        jobs = JobService.get_all_jobs()

        # Calculate funnel metrics
        funnel_data = {
            "total_applications": len(candidates),
            "screened": 0,
            "interviewed": 0,
            "shortlisted": 0,
            "offers_made": 0,
            "hired": 0
        }

        for candidate in candidates:
            stage = candidate.get("current_stage", "applied")
            if stage in ["screened", "interviewed", "shortlisted", "offer-made", "hired"]:
                funnel_data[stage] = funnel_data.get(stage, 0) + 1

        # Calculate conversion rates
        funnel_data["conversion_rates"] = {
            "screened_rate": round((funnel_data["screened"] / max(funnel_data["total_applications"], 1)) * 100, 2),
            "interviewed_rate": round((funnel_data["interviewed"] / max(funnel_data["screened"], 1)) * 100, 2),
            "shortlisted_rate": round((funnel_data["shortlisted"] / max(funnel_data["interviewed"], 1)) * 100, 2),
            "offer_rate": round((funnel_data["offers_made"] / max(funnel_data["shortlisted"], 1)) * 100, 2),
            "hire_rate": round((funnel_data["hired"] / max(funnel_data["offers_made"], 1)) * 100, 2)
        }

        return funnel_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recruitment funnel: {str(e)}")


@router.get("/performance/recruiters")
def get_recruiter_performance():
    """Get recruiter performance metrics"""
    try:
        candidates = CandidateService.get_all_candidates()
        jobs = JobService.get_all_jobs()

        # Group candidates by recruiter
        recruiter_performance = {}

        for candidate in candidates:
            recruiter_id = candidate.get("assigned_recruiter")
            if recruiter_id:
                if recruiter_id not in recruiter_performance:
                    recruiter_performance[recruiter_id] = {
                        "total_candidates": 0,
                        "hired_candidates": 0,
                        "active_candidates": 0,
                        "avg_time_to_hire": 0,
                        "conversion_rate": 0
                    }

                recruiter_performance[recruiter_id]["total_candidates"] += 1

                if candidate.get("current_stage") == "hired":
                    recruiter_performance[recruiter_id]["hired_candidates"] += 1

                if candidate.get("status") == "active":
                    recruiter_performance[recruiter_id]["active_candidates"] += 1

        # Calculate conversion rates
        for recruiter_id, metrics in recruiter_performance.items():
            if metrics["total_candidates"] > 0:
                metrics["conversion_rate"] = round(
                    (metrics["hired_candidates"] / metrics["total_candidates"]) * 100, 2)

        return {
            "recruiter_performance": recruiter_performance,
            "total_recruiters": len(recruiter_performance),
            "avg_conversion_rate": round(sum(m["conversion_rate"] for m in recruiter_performance.values()) / max(len(recruiter_performance), 1), 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recruiter performance: {str(e)}")


@router.get("/")
def get_dashboard_stats():
    """Get basic dashboard statistics"""
    try:
        candidates = CandidateService.get_all_candidates()
        jobs = JobService.get_all_jobs()
        events = EventService.get_all_events()
        interviews = InterviewService.get_all_interviews()

        return {
            "total_candidates": len(candidates),
            "total_jobs": len(jobs),
            "total_events": len(events),
            "total_interviews": len(interviews),
            "active_jobs": sum(1 for job in jobs if job.get("status") == "Active"),
            "upcoming_events": sum(1 for event in events if datetime.fromisoformat(event.get("date", "2024-01-01")) >= datetime.now()),
            "scheduled_interviews": sum(1 for interview in interviews if interview.get("status") == "scheduled")
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard stats: {str(e)}")


@router.get("/candidates/by-stage")
def get_candidates_by_stage():
    """Get candidates grouped by recruitment stage"""
    try:
        candidates = CandidateService.get_all_candidates()

        stage_breakdown = {}
        for candidate in candidates:
            stage = candidate.get("current_stage", "applied")
            if stage not in stage_breakdown:
                stage_breakdown[stage] = []
            stage_breakdown[stage].append({
                "id": candidate.get("id"),
                "name": candidate.get("name"),
                "email": candidate.get("email"),
                "applied_date": candidate.get("applied_date")
            })

        return {
            "stage_breakdown": stage_breakdown,
            "total_stages": len(stage_breakdown),
            "total_candidates": len(candidates)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting candidates by stage: {str(e)}")


@router.get("/interviews/status")
def get_interview_status():
    """Get interview status breakdown"""
    try:
        interviews = InterviewService.get_all_interviews()

        status_breakdown = {}
        for interview in interviews:
            status = interview.get("status", "scheduled")
            if status not in status_breakdown:
                status_breakdown[status] = []
            status_breakdown[status].append({
                "id": interview.get("id"),
                "candidate_id": interview.get("candidate_id"),
                "date": interview.get("date"),
                "time": interview.get("time"),
                "type": interview.get("type")
            })

        return {
            "status_breakdown": status_breakdown,
            "total_interviews": len(interviews),
            "scheduled": len(status_breakdown.get("scheduled", [])),
            "in_progress": len(status_breakdown.get("in-progress", [])),
            "completed": len(status_breakdown.get("completed", [])),
            "cancelled": len(status_breakdown.get("cancelled", []))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview status: {str(e)}")
