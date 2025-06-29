from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from models import Job, Position, RecruitmentStage
from firestore_client import db


class JobService:
    """Handles all job/position-related business logic"""

    @classmethod
    def create_job(cls, job_data: Dict[str, Any], created_by: str = "system") -> Dict[str, Any]:
        """Create a new job posting with workflow initialization"""
        try:
            # Generate ID if not provided
            if 'id' not in job_data:
                job_data['id'] = db.collection("jobs").document().id

            # Initialize workflow fields
            job_data.update({
                'createdBy': created_by,
                'createdAt': datetime.now().isoformat(),
                'status': job_data.get('status', 'Active'),
                'applicants': 0,
                'shortlisted': 0,
                'interviewed': 0,
                'hiringManagerId': job_data.get('hiringManagerId'),
                'recruiterIds': job_data.get('recruiterIds', []),
                'targetHires': job_data.get('targetHires', 1),
                'priority': job_data.get('priority', 'medium')
            })

            # Create the job
            doc_ref = db.collection("jobs").document(job_data['id'])
            doc_ref.set(job_data)

            # Also create corresponding position if not exists
            cls._ensure_position_exists(job_data)

            return {"success": True, "job_id": job_data['id']}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def update_job(cls, job_id: str, updates: Dict[str, Any], updated_by: str = "system") -> Dict[str, Any]:
        """Update job with tracking"""
        try:
            doc_ref = db.collection("jobs").document(job_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Job not found"}

            # Add metadata
            updates.update({
                'updatedBy': updated_by,
                'updatedAt': datetime.now().isoformat()
            })

            # Update the document
            doc_ref.update(updates)

            return {"success": True, "updated_fields": list(updates.keys())}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def get_job_with_metrics(cls, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job with real-time metrics"""
        try:
            doc = db.collection("jobs").document(job_id).get()
            if not doc.exists:
                return None

            job_data = doc.to_dict()

            # Calculate real-time metrics
            metrics = cls._calculate_job_metrics(job_id)
            job_data.update(metrics)

            # Add candidate pipeline
            job_data['pipeline'] = cls._get_job_pipeline(job_id)

            # Add recent activity
            job_data['recentActivity'] = cls._get_job_recent_activity(job_id)

            return job_data

        except Exception as e:
            print(f"Error getting job with metrics: {str(e)}")
            return None

    @classmethod
    def get_all_jobs_with_metrics(cls) -> List[Dict[str, Any]]:
        """Get all jobs with real-time metrics"""
        try:
            docs = db.collection("jobs").stream()
            jobs = []

            for doc in docs:
                job_data = doc.to_dict()
                job_id = doc.id

                # Calculate real-time metrics
                metrics = cls._calculate_job_metrics(job_id)
                job_data.update(metrics)

                jobs.append(job_data)

            # Sort by priority and creation date
            jobs.sort(key=lambda x: (
                {'high': 0, 'medium': 1, 'low': 2}.get(
                    x.get('priority', 'medium'), 1),
                x.get('createdAt', '')
            ), reverse=True)

            return jobs

        except Exception as e:
            print(f"Error getting jobs with metrics: {str(e)}")
            return []

    @classmethod
    def get_job_analytics(cls) -> Dict[str, Any]:
        """Get comprehensive job analytics"""
        try:
            jobs = list(db.collection("jobs").stream())
            candidates = list(db.collection("candidates").stream())

            total_jobs = len(jobs)
            total_candidates = len(candidates)

            if total_jobs == 0:
                return {"total_jobs": 0, "total_candidates": total_candidates}

            # Job status distribution
            status_counts = {}
            department_counts = {}
            location_counts = {}
            priority_counts = {}

            # Performance metrics
            total_applicants = 0
            total_shortlisted = 0
            total_interviewed = 0

            for job_doc in jobs:
                job_data = job_doc.to_dict()
                job_id = job_doc.id

                # Status distribution
                status = job_data.get('status', 'Active')
                status_counts[status] = status_counts.get(status, 0) + 1

                # Department distribution
                department = job_data.get('department', 'Unknown')
                department_counts[department] = department_counts.get(
                    department, 0) + 1

                # Location distribution
                location = job_data.get('location', 'Unknown')
                location_counts[location] = location_counts.get(
                    location, 0) + 1

                # Priority distribution
                priority = job_data.get('priority', 'medium')
                priority_counts[priority] = priority_counts.get(
                    priority, 0) + 1

                # Calculate real metrics
                job_metrics = cls._calculate_job_metrics(job_id)
                total_applicants += job_metrics.get('applicants', 0)
                total_shortlisted += job_metrics.get('shortlisted', 0)
                total_interviewed += job_metrics.get('interviewed', 0)

            # Calculate conversion rates
            shortlist_rate = (
                total_shortlisted / total_applicants * 100) if total_applicants > 0 else 0
            interview_rate = (
                total_interviewed / total_shortlisted * 100) if total_shortlisted > 0 else 0

            # Top performing jobs
            top_jobs = cls._get_top_performing_jobs()

            # Recent job activity
            recent_jobs = cls._get_recent_job_activity()

            analytics = {
                'total_jobs': total_jobs,
                'total_candidates': total_candidates,
                'status_distribution': status_counts,
                'department_distribution': department_counts,
                'location_distribution': location_counts,
                'priority_distribution': priority_counts,
                'performance_metrics': {
                    'total_applicants': total_applicants,
                    'total_shortlisted': total_shortlisted,
                    'total_interviewed': total_interviewed,
                    'shortlist_rate': round(shortlist_rate, 2),
                    'interview_rate': round(interview_rate, 2)
                },
                'top_performing_jobs': top_jobs,
                'recent_activity': recent_jobs
            }

            return analytics

        except Exception as e:
            print(f"Error getting job analytics: {str(e)}")
            return {"error": str(e)}

    @classmethod
    def assign_recruiter(cls, job_id: str, recruiter_id: str, assigned_by: str) -> Dict[str, Any]:
        """Assign a recruiter to a job"""
        try:
            doc_ref = db.collection("jobs").document(job_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Job not found"}

            job_data = doc.to_dict()
            recruiter_ids = job_data.get('recruiterIds', [])

            # Add recruiter if not already assigned
            if recruiter_id not in recruiter_ids:
                recruiter_ids.append(recruiter_id)

                result = cls.update_job(
                    job_id=job_id,
                    updates={'recruiterIds': recruiter_ids},
                    updated_by=assigned_by
                )

                if result['success']:
                    return {"success": True, "message": f"Recruiter {recruiter_id} assigned to job"}
                else:
                    return result
            else:
                return {"success": False, "error": "Recruiter already assigned to this job"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def set_hiring_manager(cls, job_id: str, manager_id: str, assigned_by: str) -> Dict[str, Any]:
        """Assign a hiring manager to a job"""
        try:
            result = cls.update_job(
                job_id=job_id,
                updates={'hiringManagerId': manager_id},
                updated_by=assigned_by
            )

            if result['success']:
                return {"success": True, "message": f"Hiring manager {manager_id} assigned to job"}
            else:
                return result

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def close_job(cls, job_id: str, reason: str, closed_by: str) -> Dict[str, Any]:
        """Close a job posting"""
        try:
            result = cls.update_job(
                job_id=job_id,
                updates={
                    'status': 'Closed',
                    'closedReason': reason,
                    'closedAt': datetime.now().isoformat()
                },
                updated_by=closed_by
            )

            return result

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def reopen_job(cls, job_id: str, reopened_by: str) -> Dict[str, Any]:
        """Reopen a closed job posting"""
        try:
            result = cls.update_job(
                job_id=job_id,
                updates={
                    'status': 'Active',
                    'reopenedAt': datetime.now().isoformat(),
                    'closedReason': None
                },
                updated_by=reopened_by
            )

            return result

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def get_job_candidates(cls, job_id: str, stage: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all candidates for a specific job, optionally filtered by stage"""
        try:
            # Find candidates by positionId (assuming job_id maps to positionId)
            query = db.collection("candidates").where(
                "positionId", "==", job_id)

            if stage:
                query = query.where("currentStage", "==", stage)

            docs = query.stream()
            candidates = [doc.to_dict() for doc in docs]

            # Sort by application date
            candidates.sort(key=lambda x: x.get(
                'appliedDate', ''), reverse=True)

            return candidates

        except Exception as e:
            print(f"Error getting job candidates: {str(e)}")
            return []

    # Private helper methods
    @classmethod
    def _calculate_job_metrics(cls, job_id: str) -> Dict[str, Any]:
        """Calculate real-time metrics for a job"""
        try:
            # Get all candidates for this job (using positionId)
            candidates = cls.get_job_candidates(job_id)

            metrics = {
                'applicants': len(candidates),
                'shortlisted': 0,
                'interviewed': 0,
                'rejected': 0,
                'in_final_review': 0,
                'stage_breakdown': {}
            }

            # Count by stage and status
            for candidate in candidates:
                stage = candidate.get('currentStage', 'applied')
                status = candidate.get('status', 'new')

                # Update stage breakdown
                metrics['stage_breakdown'][stage] = metrics['stage_breakdown'].get(
                    stage, 0) + 1

                # Update specific counters
                if status == 'shortlist' or stage in ['final-review', 'shortlisted']:
                    metrics['shortlisted'] += 1

                if stage in ['interviewed', 'final-review', 'shortlisted']:
                    metrics['interviewed'] += 1

                if status == 'reject':
                    metrics['rejected'] += 1

                if stage == 'final-review':
                    metrics['in_final_review'] += 1

            return metrics

        except Exception as e:
            print(f"Error calculating job metrics: {str(e)}")
            return {'applicants': 0, 'shortlisted': 0, 'interviewed': 0, 'rejected': 0}

    @classmethod
    def _get_job_pipeline(cls, job_id: str) -> Dict[str, Any]:
        """Get detailed recruitment pipeline for a job"""
        try:
            candidates = cls.get_job_candidates(job_id)

            pipeline = {
                'total_candidates': len(candidates),
                'stages': {},
                'conversion_rates': {},
                'recent_activity': []
            }

            # Group candidates by stage
            stage_counts = {}
            for candidate in candidates:
                stage = candidate.get('currentStage', 'applied')
                stage_counts[stage] = stage_counts.get(stage, 0) + 1

            # Build stage breakdown
            stages_order = ['applied', 'screened',
                            'interviewed', 'final-review', 'shortlisted']
            for stage in stages_order:
                count = stage_counts.get(stage, 0)
                pipeline['stages'][stage] = {
                    'count': count,
                    'percentage': (count / len(candidates) * 100) if candidates else 0
                }

            # Calculate conversion rates
            for i in range(len(stages_order) - 1):
                current_stage = stages_order[i]
                next_stage = stages_order[i + 1]

                current_count = stage_counts.get(current_stage, 0)
                next_count = stage_counts.get(next_stage, 0)

                if current_count > 0:
                    rate = (next_count / current_count) * 100
                    pipeline['conversion_rates'][f"{current_stage}_to_{next_stage}"] = round(
                        rate, 2)

            # Recent activity (last 5 candidates)
            recent_candidates = sorted(candidates, key=lambda x: x.get(
                'appliedDate', ''), reverse=True)[:5]
            for candidate in recent_candidates:
                pipeline['recent_activity'].append({
                    'candidate_name': candidate.get('name'),
                    'action': 'applied',
                    'date': candidate.get('appliedDate'),
                    'current_stage': candidate.get('currentStage')
                })

            return pipeline

        except Exception as e:
            print(f"Error getting job pipeline: {str(e)}")
            return {'total_candidates': 0, 'stages': {}, 'conversion_rates': {}}

    @classmethod
    def _get_job_recent_activity(cls, job_id: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent activity for a job"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            activity = []

            # Get recent applications
            candidates = cls.get_job_candidates(job_id)
            for candidate in candidates:
                applied_date = candidate.get('appliedDate', '')
                try:
                    applied_dt = datetime.fromisoformat(
                        applied_date.replace('Z', '+00:00'))
                    if applied_dt >= cutoff_date:
                        activity.append({
                            'type': 'application',
                            'candidate_name': candidate.get('name'),
                            'timestamp': applied_date,
                            'details': f"Applied for {candidate.get('position')}"
                        })
                except:
                    continue

            # Get recent stage transitions from workflow actions
            try:
                workflow_docs = db.collection("workflow_actions").where(
                    "timestamp", ">=", cutoff_date.isoformat()
                ).stream()

                for doc in workflow_docs:
                    action_data = doc.to_dict()
                    candidate_id = action_data.get('candidateId')

                    # Check if this candidate belongs to this job
                    if candidate_id:
                        candidate_doc = db.collection(
                            "candidates").document(candidate_id).get()
                        if candidate_doc.exists:
                            candidate_data = candidate_doc.to_dict()
                            if candidate_data.get('positionId') == job_id:
                                activity.append({
                                    'type': 'workflow_action',
                                    'candidate_name': candidate_data.get('name'),
                                    'timestamp': action_data.get('timestamp'),
                                    'details': f"Action: {action_data.get('action')}"
                                })
            except:
                pass

            # Sort by timestamp
            activity.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            return activity[:10]  # Return last 10 activities

        except Exception as e:
            print(f"Error getting job recent activity: {str(e)}")
            return []

    @classmethod
    def _get_top_performing_jobs(cls, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top performing jobs by various metrics"""
        try:
            jobs = list(db.collection("jobs").stream())
            job_performance = []

            for job_doc in jobs:
                job_data = job_doc.to_dict()
                job_id = job_doc.id

                metrics = cls._calculate_job_metrics(job_id)

                # Calculate performance score
                applicants = metrics.get('applicants', 0)
                shortlisted = metrics.get('shortlisted', 0)
                interviewed = metrics.get('interviewed', 0)

                performance_score = 0
                if applicants > 0:
                    performance_score = (
                        shortlisted * 0.3 + interviewed * 0.7) / applicants * 100

                job_performance.append({
                    'id': job_id,
                    'title': job_data.get('title'),
                    'department': job_data.get('department'),
                    'applicants': applicants,
                    'shortlisted': shortlisted,
                    'interviewed': interviewed,
                    'performance_score': round(performance_score, 2)
                })

            # Sort by performance score
            job_performance.sort(
                key=lambda x: x['performance_score'], reverse=True)
            return job_performance[:limit]

        except Exception as e:
            print(f"Error getting top performing jobs: {str(e)}")
            return []

    @classmethod
    def _get_recent_job_activity(cls, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent job-related activity"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            activity = []

            # Get recently created jobs
            jobs = list(db.collection("jobs").stream())
            for job_doc in jobs:
                job_data = job_doc.to_dict()
                created_at = job_data.get('createdAt', '')

                try:
                    created_dt = datetime.fromisoformat(
                        created_at.replace('Z', '+00:00'))
                    if created_dt >= cutoff_date:
                        activity.append({
                            'type': 'job_created',
                            'job_title': job_data.get('title'),
                            'timestamp': created_at,
                            'details': f"New job posting: {job_data.get('title')}"
                        })
                except:
                    continue

            # Sort by timestamp
            activity.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            return activity

        except Exception as e:
            print(f"Error getting recent job activity: {str(e)}")
            return []

    @classmethod
    def _ensure_position_exists(cls, job_data: Dict[str, Any]):
        """Ensure a corresponding position exists for the job"""
        try:
            position_id = job_data['id']
            position_doc = db.collection(
                "positions").document(position_id).get()

            if not position_doc.exists:
                position_data = {
                    'id': position_id,
                    'title': job_data.get('title'),
                    'department': job_data.get('department'),
                    'location': job_data.get('location'),
                    'description': job_data.get('description', ''),
                    'requirements': job_data.get('requirements', []),
                    'hiringManagerId': job_data.get('hiringManagerId'),
                    'status': 'open',
                    'priority': job_data.get('priority', 'medium')
                }

                db.collection("positions").document(
                    position_id).set(position_data)

        except Exception as e:
            print(f"Error ensuring position exists: {str(e)}")
