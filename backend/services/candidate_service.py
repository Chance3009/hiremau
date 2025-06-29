from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from models import (
    Candidate, RecruitmentStage, CandidateAction, Interview, InterviewStatus,
    InterviewType, Interviewer, Note, AIAnalysis, AISummary
)
from firestore_client import db
from services.workflow_service import WorkflowService


class CandidateService:
    """Handles all candidate-related business logic"""

    @classmethod
    def create_candidate(cls, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new candidate with workflow initialization"""
        try:
            # Generate ID if not provided
            if 'id' not in candidate_data:
                candidate_data['id'] = db.collection(
                    "candidates").document().id

            # Initialize workflow fields
            candidate_data.update({
                'currentStage': RecruitmentStage.APPLIED.value,
                'stageHistory': [],
                'lastActionDate': datetime.now().isoformat(),
                'status': 'new'
            })

            # Initialize AI analysis if not provided
            if 'aiAnalysis' not in candidate_data:
                candidate_data['aiAnalysis'] = cls._generate_default_ai_analysis()

            if 'aiSummary' not in candidate_data:
                candidate_data['aiSummary'] = cls._generate_default_ai_summary()

            # Create the candidate
            doc_ref = db.collection("candidates").document(
                candidate_data['id'])
            doc_ref.set(candidate_data)

            # Log the application action
            WorkflowService.perform_action(
                candidate_id=candidate_data['id'],
                action=CandidateAction.VIEW_PROFILE,
                performed_by="system",
                notes="Candidate application received"
            )

            return {"success": True, "candidate_id": candidate_data['id']}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def get_candidate(cls, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Get a candidate by ID with enriched data"""
        try:
            doc = db.collection("candidates").document(candidate_id).get()
            if not doc.exists:
                return None

            candidate_data = doc.to_dict()

            # Enrich with current available actions
            available_actions = WorkflowService.get_available_actions(
                candidate_id)
            candidate_data['availableActions'] = [
                action.value for action in available_actions]

            # Add interview history
            candidate_data['interviews'] = cls._get_candidate_interviews(
                candidate_id)

            # Add workflow metrics
            candidate_data['workflowMetrics'] = cls._calculate_candidate_metrics(
                candidate_data)

            return candidate_data

        except Exception as e:
            print(f"Error getting candidate: {str(e)}")
            return None

    @classmethod
    def update_candidate(cls, candidate_id: str, updates: Dict[str, Any], updated_by: str = "system") -> Dict[str, Any]:
        """Update candidate with workflow tracking"""
        try:
            doc_ref = db.collection("candidates").document(candidate_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Candidate not found"}

            # Add metadata
            updates['lastActionDate'] = datetime.now().isoformat()

            # Update the document
            doc_ref.update(updates)

            # Log the update action if it's a significant change
            significant_fields = ['currentStage',
                                  'status', 'assignedRecruiter']
            if any(field in updates for field in significant_fields):
                WorkflowService._log_workflow_action({
                    'action': 'update_profile',
                    'candidateId': candidate_id,
                    'performedBy': updated_by,
                    'timestamp': datetime.now().isoformat(),
                    'metadata': {'updated_fields': list(updates.keys())},
                    'notes': f"Profile updated: {', '.join(updates.keys())}"
                })

            return {"success": True, "updated_fields": list(updates.keys())}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def search_candidates(cls, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Advanced candidate search with multiple filters"""
        try:
            query = db.collection("candidates")

            # Apply filters
            if 'stage' in filters:
                query = query.where("currentStage", "==", filters['stage'])
                print(f"Filtering by stage: {filters['stage']}")  # Debug log

            if 'status' in filters:
                query = query.where("status", "==", filters['status'])

            if 'eventId' in filters:
                query = query.where("eventId", "==", filters['eventId'])

            if 'positionId' in filters:
                query = query.where("positionId", "==", filters['positionId'])

            if 'assignedRecruiter' in filters:
                query = query.where("assignedRecruiter",
                                    "==", filters['assignedRecruiter'])

            # Execute query
            docs = query.stream()
            candidates = [doc.to_dict() for doc in docs]

            # Apply additional filters that can't be done in Firestore
            if 'skills' in filters:
                required_skills = filters['skills']
                candidates = [
                    c for c in candidates
                    if any(skill.lower() in [s.lower() for s in c.get('skills', [])]
                           for skill in required_skills)
                ]

            if 'minExperience' in filters:
                min_exp = int(filters['minExperience'])
                candidates = [
                    c for c in candidates
                    if cls._extract_experience_years(c.get('experience', '0')) >= min_exp
                ]

            if 'location' in filters:
                location = filters['location'].lower()
                candidates = [
                    c for c in candidates
                    if location in c.get('location', '').lower()
                ]

            if 'visaStatus' in filters:
                candidates = [
                    c for c in candidates
                    if c.get('visaStatus') == filters['visaStatus']
                ]

            # Sort results
            sort_by = filters.get('sortBy', 'appliedDate')
            reverse = filters.get('sortOrder', 'desc') == 'desc'

            if sort_by == 'score':
                candidates.sort(key=lambda x: x.get(
                    'aiMatch', 0), reverse=reverse)
            elif sort_by == 'appliedDate':
                candidates.sort(key=lambda x: x.get(
                    'appliedDate', ''), reverse=reverse)
            elif sort_by == 'name':
                candidates.sort(key=lambda x: x.get(
                    'name', ''), reverse=reverse)

            # Apply limit
            limit = filters.get('limit', 50)
            candidates = candidates[:limit]

            return candidates

        except Exception as e:
            print(f"Error searching candidates: {str(e)}")
            return []

    @classmethod
    def get_candidate_analytics(cls) -> Dict[str, Any]:
        """Get comprehensive candidate analytics"""
        try:
            candidates = list(db.collection("candidates").stream())
            total_candidates = len(candidates)

            if total_candidates == 0:
                return {"total_candidates": 0}

            # Stage distribution
            stage_counts = {}
            status_counts = {}
            source_counts = {}
            skill_counts = {}
            location_counts = {}

            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()

                # Stage distribution
                stage = candidate_data.get('currentStage', 'applied')
                stage_counts[stage] = stage_counts.get(stage, 0) + 1

                # Status distribution
                status = candidate_data.get('status', 'new')
                status_counts[status] = status_counts.get(status, 0) + 1

                # Source (event) distribution
                event_id = candidate_data.get('eventId', 'unknown')
                source_counts[event_id] = source_counts.get(event_id, 0) + 1

                # Skills analysis
                for skill in candidate_data.get('skills', []):
                    skill_counts[skill] = skill_counts.get(skill, 0) + 1

                # Location distribution
                location = candidate_data.get('location', 'unknown')
                location_counts[location] = location_counts.get(
                    location, 0) + 1

            # Calculate metrics
            analytics = {
                'total_candidates': total_candidates,
                'stage_distribution': stage_counts,
                'status_distribution': status_counts,
                'source_distribution': source_counts,
                'top_skills': dict(sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
                'location_distribution': location_counts,
                'conversion_rates': cls._calculate_conversion_rates(stage_counts),
                'average_scores': cls._calculate_average_scores(candidates),
                'recent_applications': cls._get_recent_applications(candidates)
            }

            return analytics

        except Exception as e:
            print(f"Error getting candidate analytics: {str(e)}")
            return {"error": str(e)}

    @classmethod
    def bulk_action(cls, candidate_ids: List[str], action: str, performed_by: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """Perform bulk actions on multiple candidates"""
        try:
            results = {
                'success': [],
                'failed': [],
                'total': len(candidate_ids)
            }

            for candidate_id in candidate_ids:
                try:
                    # Convert string action to enum
                    candidate_action = CandidateAction(action)

                    result = WorkflowService.perform_action(
                        candidate_id=candidate_id,
                        action=candidate_action,
                        performed_by=performed_by,
                        notes=notes
                    )

                    if result.success:
                        results['success'].append(candidate_id)
                    else:
                        results['failed'].append({
                            'candidate_id': candidate_id,
                            'error': result.message
                        })

                except Exception as e:
                    results['failed'].append({
                        'candidate_id': candidate_id,
                        'error': str(e)
                    })

            return results

        except Exception as e:
            return {"error": str(e), "success": [], "failed": candidate_ids}

    @classmethod
    def assign_recruiter(cls, candidate_id: str, recruiter_id: str, assigned_by: str) -> Dict[str, Any]:
        """Assign a recruiter to a candidate"""
        try:
            result = cls.update_candidate(
                candidate_id=candidate_id,
                updates={'assignedRecruiter': recruiter_id},
                updated_by=assigned_by
            )

            if result['success']:
                # Log the assignment
                WorkflowService._log_workflow_action({
                    'action': 'assign_recruiter',
                    'candidateId': candidate_id,
                    'performedBy': assigned_by,
                    'timestamp': datetime.now().isoformat(),
                    'metadata': {'recruiter_id': recruiter_id},
                    'notes': f"Assigned recruiter: {recruiter_id}"
                })

            return result

        except Exception as e:
            return {"success": False, "error": str(e)}

    # Private helper methods
    @classmethod
    def _get_candidate_interviews(cls, candidate_id: str) -> List[Dict[str, Any]]:
        """Get all interviews for a candidate"""
        try:
            docs = db.collection("interviews").where(
                "candidateId", "==", candidate_id).stream()
            interviews = []

            for doc in docs:
                interview_data = doc.to_dict()
                # Enrich with additional data if needed
                interviews.append(interview_data)

            # Sort by date
            interviews.sort(key=lambda x: x.get('date', ''), reverse=True)
            return interviews

        except Exception as e:
            print(f"Error getting candidate interviews: {str(e)}")
            return []

    @classmethod
    def _calculate_candidate_metrics(cls, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate workflow metrics for a candidate"""
        try:
            stage_history = candidate_data.get('stageHistory', [])
            applied_date = candidate_data.get('appliedDate', '')

            metrics = {
                'days_in_pipeline': 0,
                'stage_transitions': len(stage_history),
                'current_stage_duration': 0,
                'average_stage_duration': 0
            }

            if applied_date:
                # Calculate days in pipeline
                try:
                    applied_dt = datetime.fromisoformat(
                        applied_date.replace('Z', '+00:00'))
                    metrics['days_in_pipeline'] = (
                        datetime.now() - applied_dt).days
                except:
                    pass

            # Calculate current stage duration
            if stage_history:
                last_transition = stage_history[-1]
                try:
                    transition_dt = datetime.fromisoformat(
                        last_transition['timestamp'])
                    metrics['current_stage_duration'] = (
                        datetime.now() - transition_dt).days
                except:
                    pass

            return metrics

        except Exception as e:
            print(f"Error calculating candidate metrics: {str(e)}")
            return {}

    @classmethod
    def _extract_experience_years(cls, experience_text: str) -> int:
        """Extract years of experience from text"""
        try:
            import re
            # Look for patterns like "5 years", "3-5 years", etc.
            matches = re.findall(r'(\d+)', experience_text)
            if matches:
                return int(matches[0])
            return 0
        except:
            return 0

    @classmethod
    def _calculate_conversion_rates(cls, stage_counts: Dict[str, int]) -> Dict[str, float]:
        """Calculate conversion rates between stages"""
        try:
            stages = ['applied', 'screened', 'interviewed',
                      'final-review', 'shortlisted']
            conversion_rates = {}

            for i in range(len(stages) - 1):
                current_stage = stages[i]
                next_stage = stages[i + 1]

                current_count = stage_counts.get(current_stage, 0)
                next_count = stage_counts.get(next_stage, 0)

                if current_count > 0:
                    rate = (next_count / current_count) * 100
                    conversion_rates[f"{current_stage}_to_{next_stage}"] = round(
                        rate, 2)

            return conversion_rates

        except Exception as e:
            print(f"Error calculating conversion rates: {str(e)}")
            return {}

    @classmethod
    def _calculate_average_scores(cls, candidates: List) -> Dict[str, float]:
        """Calculate average scores across all candidates"""
        try:
            if not candidates:
                return {}

            total_ai_match = 0
            total_screening = 0
            count = 0

            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()
                total_ai_match += candidate_data.get('aiMatch', 0)
                total_screening += candidate_data.get('screeningScore', 0)
                count += 1

            return {
                'average_ai_match': round(total_ai_match / count, 2) if count > 0 else 0,
                'average_screening_score': round(total_screening / count, 2) if count > 0 else 0
            }

        except Exception as e:
            print(f"Error calculating average scores: {str(e)}")
            return {}

    @classmethod
    def _get_recent_applications(cls, candidates: List, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent applications within specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            recent = []

            for candidate_doc in candidates:
                candidate_data = candidate_doc.to_dict()
                applied_date = candidate_data.get('appliedDate', '')

                try:
                    applied_dt = datetime.fromisoformat(
                        applied_date.replace('Z', '+00:00'))
                    if applied_dt >= cutoff_date:
                        recent.append({
                            'id': candidate_data.get('id'),
                            'name': candidate_data.get('name'),
                            'position': candidate_data.get('position'),
                            'appliedDate': applied_date,
                            'currentStage': candidate_data.get('currentStage')
                        })
                except:
                    continue

            # Sort by application date
            recent.sort(key=lambda x: x.get('appliedDate', ''), reverse=True)
            return recent

        except Exception as e:
            print(f"Error getting recent applications: {str(e)}")
            return []

    @classmethod
    def _generate_default_ai_analysis(cls) -> Dict[str, Any]:
        """Generate default AI analysis structure"""
        return {
            "overallMatch": 75.0,
            "skillMatches": [],
            "cultureFit": 75.0,
            "growthPotential": 75.0,
            "riskFactors": [],
            "insights": [],
            "recommendedRole": "To be analyzed",
            "similarRoles": [],
            "learningPath": []
        }

    @classmethod
    def _generate_default_ai_summary(cls) -> Dict[str, Any]:
        """Generate default AI summary structure"""
        return {
            "strengths": ["To be analyzed"],
            "considerations": ["Pending analysis"],
            "fitAnalysis": "Analysis pending"
        }
