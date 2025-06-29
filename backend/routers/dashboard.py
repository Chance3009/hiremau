from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from firestore_client import db
from datetime import datetime, timedelta
from services.workflow_service import WorkflowService

router = APIRouter(tags=["dashboard"])


@router.get("/overview")
def get_dashboard_overview():
    """Get comprehensive dashboard overview with real data"""
    try:
        # Get all collections
        candidates = list(db.collection("candidates").stream())
        jobs = list(db.collection("jobs").stream())
        events = list(db.collection("events").stream())
        interviews = list(db.collection("interviews").stream())

        # Calculate candidate metrics by stage
        stage_counts = {}
        total_candidates = len(candidates)

        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage = candidate_data.get("currentStage", "applied")
            stage_counts[stage] = stage_counts.get(stage, 0) + 1

        # Calculate job metrics
        active_jobs = sum(
            1 for job_doc in jobs if job_doc.to_dict().get("status") == "Active")
        total_applicants = sum(job_doc.to_dict().get(
            "applicants", 0) for job_doc in jobs)

        # Calculate event metrics
        upcoming_events = []
        past_events = []
        total_registrations = 0

        for event_doc in events:
            event_data = event_doc.to_dict()
            event_date = datetime.strptime(
                event_data.get("date", "2024-01-01"), "%Y-%m-%d")

            if event_date >= datetime.now():
                upcoming_events.append(event_data)
            else:
                past_events.append(event_data)

            total_registrations += event_data.get("registrations", 0)

        # Calculate interview metrics
        scheduled_interviews = sum(
            1 for interview_doc in interviews if interview_doc.to_dict().get("status") == "scheduled")
        completed_interviews = sum(
            1 for interview_doc in interviews if interview_doc.to_dict().get("status") == "completed")

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
        events = []
        event_docs = db.collection("events").stream()

        for event_doc in event_docs:
            event_data = event_doc.to_dict()

            # Get candidates for this event
            event_candidates = list(db.collection("candidates").where(
                "eventId", "==", event_data["id"]).stream())

            # Get interviews for this event
            event_interviews = list(db.collection("interviews").where(
                "eventId", "==", event_data["id"]).stream())

            # Calculate event-specific metrics
            event_metrics = {
                "totalCandidates": len(event_candidates),
                "scheduledInterviews": sum(1 for i in event_interviews if i.to_dict().get("status") == "scheduled"),
                "completedInterviews": sum(1 for i in event_interviews if i.to_dict().get("status") == "completed"),
                "candidatesByStage": {}
            }

            # Count candidates by stage for this event
            for candidate_doc in event_candidates:
                candidate_data = candidate_doc.to_dict()
                stage = candidate_data.get("currentStage", "applied")
                event_metrics["candidatesByStage"][stage] = event_metrics["candidatesByStage"].get(
                    stage, 0) + 1

            # Add metrics to event data
            event_data.update(event_metrics)
            events.append(event_data)

        # Sort events by date
        events.sort(key=lambda x: x.get("date", ""), reverse=True)

        return {
            "events": events,
            "totalEvents": len(events),
            "upcomingEvents": sum(1 for e in events if datetime.strptime(e.get("date", "2024-01-01"), "%Y-%m-%d") >= datetime.now()),
            "totalRegistrations": sum(e.get("registrations", 0) for e in events),
            "totalCandidates": sum(e.get("totalCandidates", 0) for e in events)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard events: {str(e)}")


@router.get("/jobs")
def get_dashboard_jobs():
    """Get all jobs with candidate metrics for dashboard"""
    try:
        jobs = []
        job_docs = db.collection("jobs").stream()

        for job_doc in job_docs:
            job_data = job_doc.to_dict()

            # Get candidates for this job (using positionId)
            job_candidates = list(db.collection("candidates").where(
                "positionId", "==", job_data["id"]).stream())

            # Calculate job-specific metrics
            job_metrics = {
                "actualCandidates": len(job_candidates),
                "candidatesByStage": {},
                "conversionRate": 0,
                "avgTimeToHire": 0  # Placeholder
            }

            # Count candidates by stage for this job
            for candidate_doc in job_candidates:
                candidate_data = candidate_doc.to_dict()
                stage = candidate_data.get("currentStage", "applied")
                job_metrics["candidatesByStage"][stage] = job_metrics["candidatesByStage"].get(
                    stage, 0) + 1

            # Calculate conversion rate (applied to final stages)
            applied_count = job_metrics["candidatesByStage"].get("applied", 0)
            final_count = (job_metrics["candidatesByStage"].get("final-review", 0) +
                           job_metrics["candidatesByStage"].get("shortlisted", 0))

            if applied_count > 0:
                job_metrics["conversionRate"] = round(
                    (final_count / applied_count) * 100, 2)

            # Update job data with actual metrics
            job_data.update(job_metrics)
            jobs.append(job_data)

        return {
            "jobs": jobs,
            "totalJobs": len(jobs),
            "activeJobs": sum(1 for j in jobs if j.get("status") == "Active"),
            "totalCandidates": sum(j.get("actualCandidates", 0) for j in jobs),
            "avgCandidatesPerJob": round(sum(j.get("actualCandidates", 0) for j in jobs) / max(len(jobs), 1), 1)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting dashboard jobs: {str(e)}")


@router.get("/recent-activity")
def get_recent_activity():
    """Get recent activity across the recruitment pipeline"""
    try:
        activities = []

        # Get recent workflow actions
        try:
            workflow_actions = db.collection("workflow_actions").order_by(
                "timestamp", direction="DESCENDING").limit(10).stream()

            for action_doc in workflow_actions:
                action_data = action_doc.to_dict()

                # Get candidate name
                candidate_doc = db.collection("candidates").document(
                    action_data.get("candidateId", "")).get()
                candidate_name = "Unknown"
                if candidate_doc.exists:
                    candidate_name = candidate_doc.to_dict().get("name", "Unknown")

                activities.append({
                    "type": "workflow_action",
                    "action": action_data.get("action", ""),
                    "candidateId": action_data.get("candidateId", ""),
                    "candidateName": candidate_name,
                    "performedBy": action_data.get("performedBy", ""),
                    "timestamp": action_data.get("timestamp", ""),
                    "notes": action_data.get("notes", "")
                })
        except Exception:
            # If workflow_actions collection doesn't exist yet, use stage history
            candidates = db.collection("candidates").stream()

            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()
                stage_history = candidate_data.get("stageHistory", [])

                # Last 3 transitions per candidate
                for transition in stage_history[-3:]:
                    activities.append({
                        "type": "stage_transition",
                        "action": transition.get("action", ""),
                        "candidateId": candidate_data.get("id", ""),
                        "candidateName": candidate_data.get("name", "Unknown"),
                        "fromStage": transition.get("fromStage", ""),
                        "toStage": transition.get("toStage", ""),
                        "performedBy": transition.get("performedBy", ""),
                        "timestamp": transition.get("timestamp", ""),
                        "notes": transition.get("notes", "")
                    })

        # Sort by timestamp
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return {
            "activities": activities[:20],  # Return top 20 most recent
            "totalActivities": len(activities)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recent activity: {str(e)}")


@router.get("/analytics/pipeline")
def get_pipeline_analytics():
    """Get detailed pipeline analytics"""
    try:
        # Get workflow summary
        workflow_summary = WorkflowService.get_workflow_summary()

        # Get pipeline health
        candidates = list(db.collection("candidates").stream())

        # Calculate time-based metrics
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Count new candidates by time period
        new_this_week = 0
        new_this_month = 0

        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            applied_date_str = candidate_data.get("appliedDate", "")

            try:
                applied_date = datetime.strptime(applied_date_str, "%Y-%m-%d")
                if applied_date >= week_ago:
                    new_this_week += 1
                if applied_date >= month_ago:
                    new_this_month += 1
            except:
                continue

        # Calculate velocity (candidates moved between stages)
        velocity_metrics = {
            "candidatesMovedThisWeek": 0,
            "candidatesMovedThisMonth": 0,
            "avgTimePerStage": {},
            "bottlenecks": []
        }

        # Identify bottlenecks (stages with >40% of candidates)
        total_candidates = len(candidates)
        stage_distribution = {}

        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage = candidate_data.get("currentStage", "applied")
            stage_distribution[stage] = stage_distribution.get(stage, 0) + 1

        for stage, count in stage_distribution.items():
            if total_candidates > 0 and (count / total_candidates) > 0.4:
                velocity_metrics["bottlenecks"].append({
                    "stage": stage,
                    "count": count,
                    "percentage": round((count / total_candidates) * 100, 2)
                })

        return {
            "summary": {
                "totalCandidates": workflow_summary.totalCandidates,
                "newThisWeek": new_this_week,
                "newThisMonth": new_this_month,
                "stageBreakdown": stage_distribution
            },
            "velocity": velocity_metrics,
            "workflow": {
                "stageBreakdown": [
                    {
                        "stage": stage.stage.value,
                        "label": stage.label,
                        "count": stage.candidateCount,
                        "percentage": round((stage.candidateCount / max(workflow_summary.totalCandidates, 1)) * 100, 2)
                    }
                    for stage in workflow_summary.stageBreakdown
                ],
                "recentTransitions": [
                    {
                        "candidateId": t.candidateId,
                        "fromStage": t.fromStage.value if t.fromStage else "",
                        "toStage": t.toStage.value if t.toStage else "",
                        "action": t.action.value,
                        "timestamp": t.timestamp,
                        "performedBy": t.performedBy
                    }
                    for t in workflow_summary.recentTransitions[:10]
                ]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting pipeline analytics: {str(e)}")


@router.get("/metrics/recruitment-funnel")
def get_recruitment_funnel():
    """Get detailed recruitment funnel metrics"""
    try:
        # Get all candidates
        candidates = list(db.collection("candidates").stream())

        # Initialize funnel data
        funnel_stages = [
            {"stage": "applied", "label": "Applied", "count": 0, "dropoff": 0},
            {"stage": "screened", "label": "Screened", "count": 0, "dropoff": 0},
            {"stage": "interviewed", "label": "Interviewed", "count": 0, "dropoff": 0},
            {"stage": "final-review", "label": "Final Review",
                "count": 0, "dropoff": 0},
            {"stage": "shortlisted", "label": "Shortlisted", "count": 0, "dropoff": 0}
        ]

        # Count candidates by stage
        stage_counts = {}
        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage = candidate_data.get("currentStage", "applied")
            stage_counts[stage] = stage_counts.get(stage, 0) + 1

        # Update funnel data with counts
        for funnel_stage in funnel_stages:
            stage = funnel_stage["stage"]
            funnel_stage["count"] = stage_counts.get(stage, 0)

        # Calculate dropoff rates
        for i in range(len(funnel_stages) - 1):
            current_count = funnel_stages[i]["count"]
            next_count = funnel_stages[i + 1]["count"]

            if current_count > 0:
                dropoff = current_count - next_count
                dropoff_rate = (dropoff / current_count) * 100
                funnel_stages[i]["dropoff"] = round(dropoff_rate, 2)

        return {
            "funnel": funnel_stages,
            "totalCandidates": len(candidates),
            "conversionRate": round((stage_counts.get("shortlisted", 0) / max(len(candidates), 1)) * 100, 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recruitment funnel: {str(e)}")


@router.get("/performance/recruiters")
def get_recruiter_performance():
    """Get recruiter performance metrics"""
    try:
        # Get all candidates with assigned recruiters
        candidates = list(db.collection("candidates").stream())

        recruiter_metrics = {}

        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            recruiter = candidate_data.get("assignedRecruiter", "unassigned")

            if recruiter not in recruiter_metrics:
                recruiter_metrics[recruiter] = {
                    "totalCandidates": 0,
                    "stageDistribution": {},
                    "successRate": 0,
                    "avgTimeToHire": 0
                }

            recruiter_metrics[recruiter]["totalCandidates"] += 1

            # Count by stage
            stage = candidate_data.get("currentStage", "applied")
            if stage not in recruiter_metrics[recruiter]["stageDistribution"]:
                recruiter_metrics[recruiter]["stageDistribution"][stage] = 0
            recruiter_metrics[recruiter]["stageDistribution"][stage] += 1

        # Calculate success rates
        for recruiter, metrics in recruiter_metrics.items():
            total = metrics["totalCandidates"]
            successful = (metrics["stageDistribution"].get("final-review", 0) +
                          metrics["stageDistribution"].get("shortlisted", 0))

            if total > 0:
                metrics["successRate"] = round((successful / total) * 100, 2)

        return {
            "recruiters": recruiter_metrics,
            "totalRecruiters": len(recruiter_metrics)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting recruiter performance: {str(e)}")


# Legacy endpoints for backward compatibility
@router.get("/")
def get_dashboard_stats():
    """Legacy dashboard endpoint - redirects to overview"""
    return get_dashboard_overview()


@router.get("/candidates/by-stage")
def get_candidates_by_stage():
    """Get candidate distribution by stage"""
    try:
        candidates = list(db.collection("candidates").stream())

        stage_distribution = {}
        for candidate_doc in candidates:
            candidate_data = candidate_doc.to_dict()
            stage = candidate_data.get("currentStage", "applied")
            stage_distribution[stage] = stage_distribution.get(stage, 0) + 1

        return {
            "stageDistribution": stage_distribution,
            "totalCandidates": len(candidates)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting candidates by stage: {str(e)}")


@router.get("/interviews/status")
def get_interview_status():
    """Get interview status distribution"""
    try:
        interviews = list(db.collection("interviews").stream())

        status_distribution = {}
        for interview_doc in interviews:
            interview_data = interview_doc.to_dict()
            status = interview_data.get("status", "unknown")
            status_distribution[status] = status_distribution.get(
                status, 0) + 1

        return {
            "statusDistribution": status_distribution,
            "totalInterviews": len(interviews)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting interview status: {str(e)}")
