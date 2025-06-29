from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from models import (
    Interview, InterviewStatus, InterviewType, Interviewer, Note,
    InterviewMessage, InterviewReport, InterviewEvaluation, RecruitmentStage
)
from firestore_client import db
from services.workflow_service import WorkflowService


class InterviewService:
    """Handles all interview-related business logic"""

    @classmethod
    def schedule_interview(cls, interview_data: Dict[str, Any], scheduled_by: str) -> Dict[str, Any]:
        """Schedule a new interview with workflow integration"""
        try:
            # Generate ID if not provided
            if 'id' not in interview_data:
                interview_data['id'] = db.collection(
                    "interviews").document().id

            # Set default values
            interview_data.update({
                'status': InterviewStatus.SCHEDULED.value,
                'scheduledBy': scheduled_by,
                'scheduledAt': datetime.now().isoformat(),
                'notes': interview_data.get('notes', []),
                'messages': []
            })

            # Validate candidate exists
            candidate_doc = db.collection("candidates").document(
                interview_data['candidateId']).get()
            if not candidate_doc.exists:
                return {"success": False, "error": "Candidate not found"}

            # Create the interview
            doc_ref = db.collection("interviews").document(
                interview_data['id'])
            doc_ref.set(interview_data)

            # Update candidate with interview info
            candidate_updates = {
                'scheduledInterview': {
                    'interviewId': interview_data['id'],
                    'date': interview_data['date'],
                    'time': interview_data['time'],
                    'type': interview_data.get('type', 'technical'),
                    'interviewer': interview_data.get('interviewer', {})
                }
            }

            db.collection("candidates").document(
                interview_data['candidateId']).update(candidate_updates)

            # Trigger workflow action
            result = WorkflowService.schedule_interview(
                candidate_id=interview_data['candidateId'],
                interview_data=interview_data,
                scheduled_by=scheduled_by
            )

            if result.success:
                return {
                    "success": True,
                    "interview_id": interview_data['id'],
                    "workflow_result": result.dict()
                }
            else:
                return {"success": False, "error": result.message}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def start_interview(cls, interview_id: str, started_by: str) -> Dict[str, Any]:
        """Start an interview session"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()

            if interview_data.get('status') != InterviewStatus.SCHEDULED.value:
                return {"success": False, "error": "Interview is not in scheduled status"}

            # Update interview status
            updates = {
                'status': InterviewStatus.IN_PROGRESS.value,
                'startedAt': datetime.now().isoformat()
            }

            doc_ref.update(updates)

            # Import WorkflowService here to avoid circular imports
            from services.workflow_service import WorkflowService
            from models import CandidateAction

            # Trigger workflow transition - start interview action
            result = WorkflowService.perform_action(
                candidate_id=interview_data['candidateId'],
                action=CandidateAction.START_INTERVIEW,
                performed_by=started_by,
                notes=f"Interview started at {datetime.now().strftime('%H:%M')}",
                metadata={"interview_id": interview_id}
            )

            if result.success:
                return {
                    "success": True,
                    "interview_id": interview_id,
                    "new_status": InterviewStatus.IN_PROGRESS.value,
                    "workflow_result": result.dict()
                }
            else:
                return {"success": False, "error": result.message}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def complete_interview(cls, interview_id: str, outcome: str, evaluation: Optional[Dict[str, Any]] = None, completed_by: str = "system") -> Dict[str, Any]:
        """Complete an interview with evaluation and workflow progression"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()

            if interview_data.get('status') != InterviewStatus.IN_PROGRESS.value:
                return {"success": False, "error": "Interview is not in progress"}

            # Update interview status
            updates = {
                'status': InterviewStatus.COMPLETED.value,
                'completedAt': datetime.now().isoformat(),
                'outcome': outcome
            }

            if evaluation:
                updates['evaluation'] = evaluation

            doc_ref.update(updates)

            # Clear scheduled interview from candidate
            candidate_updates = {'scheduledInterview': None}
            db.collection("candidates").document(
                interview_data['candidateId']).update(candidate_updates)

            # Generate interview report
            report_result = cls._generate_interview_report(
                interview_id, interview_data, evaluation)

            # Import WorkflowService here to avoid circular imports
            from services.workflow_service import WorkflowService

            # Trigger workflow action based on outcome
            if outcome == "pass":
                action = "move-to-final"
                notes = "Interview completed successfully - moving to final review"
            elif outcome == "fail":
                action = "reject"
                notes = "Interview completed - candidate not suitable"
            else:  # pending or needs another interview
                action = "request-another-interview"
                notes = "Interview completed - requires additional assessment"

            # Perform the workflow action
            from models import CandidateAction
            result = WorkflowService.perform_action(
                candidate_id=interview_data['candidateId'],
                action=CandidateAction(action),
                performed_by=completed_by,
                notes=notes,
                metadata={"interview_id": interview_id, "outcome": outcome}
            )

            return {
                "success": True,
                "interview_id": interview_id,
                "outcome": outcome,
                "report_generated": report_result.get('success', False),
                "workflow_result": result.dict() if result else None
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def add_interview_message(cls, interview_id: str, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a message to an interview session"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()
            messages = interview_data.get('messages', [])

            # Generate message ID and timestamp
            message_data.update({
                'id': len(messages) + 1,
                'timestamp': datetime.now().isoformat()
            })

            messages.append(message_data)

            # Update interview
            doc_ref.update({'messages': messages})

            return {"success": True, "message_id": message_data['id']}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def add_interview_note(cls, interview_id: str, note_text: str, author: str) -> Dict[str, Any]:
        """Add a note to an interview"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()
            notes = interview_data.get('notes', [])

            note = {
                'text': note_text,
                'timestamp': datetime.now().isoformat(),
                'author': author
            }

            notes.append(note)

            # Update interview
            doc_ref.update({'notes': notes})

            return {"success": True, "note_count": len(notes)}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def get_interviews_by_status(cls, status: str) -> List[Dict[str, Any]]:
        """Get interviews by status"""
        try:
            docs = db.collection("interviews").where(
                "status", "==", status).stream()
            interviews = []

            for doc in docs:
                interview_data = doc.to_dict()
                # Enrich with candidate data
                interview_data = cls._enrich_interview_data(interview_data)
                interviews.append(interview_data)

            # Sort by date and time
            interviews.sort(
                key=lambda x: f"{x.get('date', '')}{x.get('time', '')}")
            return interviews

        except Exception as e:
            print(f"Error getting interviews by status: {str(e)}")
            return []

    @classmethod
    def get_interviews_today(cls) -> List[Dict[str, Any]]:
        """Get all interviews scheduled for today"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            docs = db.collection("interviews").where(
                "date", "==", today).stream()
            interviews = []

            for doc in docs:
                interview_data = doc.to_dict()
                interview_data = cls._enrich_interview_data(interview_data)
                interviews.append(interview_data)

            # Sort by time
            interviews.sort(key=lambda x: x.get('time', ''))
            return interviews

        except Exception as e:
            print(f"Error getting today's interviews: {str(e)}")
            return []

    @classmethod
    def get_interview_analytics(cls) -> Dict[str, Any]:
        """Get comprehensive interview analytics"""
        try:
            interviews = list(db.collection("interviews").stream())
            total_interviews = len(interviews)

            if total_interviews == 0:
                return {"total_interviews": 0}

            # Status distribution
            status_counts = {}
            type_counts = {}
            outcome_counts = {}
            interviewer_counts = {}

            # Time-based metrics
            today = datetime.now().date()
            interviews_today = 0
            interviews_this_week = 0
            interviews_this_month = 0

            # Duration and completion metrics
            total_duration = 0
            completed_interviews = 0
            completion_rate = 0

            for interview_doc in interviews:
                interview_data = interview_doc.to_dict()

                # Status distribution
                status = interview_data.get('status', 'unknown')
                status_counts[status] = status_counts.get(status, 0) + 1

                # Type distribution
                interview_type = interview_data.get('type', 'unknown')
                type_counts[interview_type] = type_counts.get(
                    interview_type, 0) + 1

                # Outcome distribution
                outcome = interview_data.get('outcome')
                if outcome:
                    outcome_counts[outcome] = outcome_counts.get(
                        outcome, 0) + 1

                # Interviewer distribution
                interviewer = interview_data.get('interviewer', {})
                interviewer_name = interviewer.get('name', 'Unknown')
                interviewer_counts[interviewer_name] = interviewer_counts.get(
                    interviewer_name, 0) + 1

                # Time-based analysis
                interview_date = interview_data.get('date', '')
                try:
                    interview_dt = datetime.strptime(
                        interview_date, '%Y-%m-%d').date()

                    if interview_dt == today:
                        interviews_today += 1

                    week_start = today - timedelta(days=today.weekday())
                    if interview_dt >= week_start:
                        interviews_this_week += 1

                    month_start = today.replace(day=1)
                    if interview_dt >= month_start:
                        interviews_this_month += 1

                except:
                    pass

                # Duration analysis
                duration = interview_data.get('duration', 0)
                if duration > 0:
                    total_duration += duration

                # Completion analysis
                if status == InterviewStatus.COMPLETED.value:
                    completed_interviews += 1

            # Calculate metrics
            if total_interviews > 0:
                completion_rate = (completed_interviews /
                                   total_interviews) * 100

            average_duration = total_duration / \
                completed_interviews if completed_interviews > 0 else 0

            analytics = {
                'total_interviews': total_interviews,
                'status_distribution': status_counts,
                'type_distribution': type_counts,
                'outcome_distribution': outcome_counts,
                'interviewer_workload': interviewer_counts,
                'time_metrics': {
                    'interviews_today': interviews_today,
                    'interviews_this_week': interviews_this_week,
                    'interviews_this_month': interviews_this_month
                },
                'performance_metrics': {
                    'completion_rate': round(completion_rate, 2),
                    'average_duration': round(average_duration, 1),
                    'completed_interviews': completed_interviews
                }
            }

            return analytics

        except Exception as e:
            print(f"Error getting interview analytics: {str(e)}")
            return {"error": str(e)}

    @classmethod
    def reschedule_interview(cls, interview_id: str, new_date: str, new_time: str, rescheduled_by: str) -> Dict[str, Any]:
        """Reschedule an interview"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()

            if interview_data.get('status') not in [InterviewStatus.SCHEDULED.value]:
                return {"success": False, "error": "Only scheduled interviews can be rescheduled"}

            # Update interview
            updates = {
                'date': new_date,
                'time': new_time,
                'rescheduledBy': rescheduled_by,
                'rescheduledAt': datetime.now().isoformat()
            }

            doc_ref.update(updates)

            # Update candidate's scheduled interview info
            candidate_updates = {
                'scheduledInterview.date': new_date,
                'scheduledInterview.time': new_time
            }

            db.collection("candidates").document(
                interview_data['candidateId']).update(candidate_updates)

            # Add note about rescheduling
            cls.add_interview_note(
                interview_id=interview_id,
                note_text=f"Interview rescheduled from {interview_data.get('date')} {interview_data.get('time')} to {new_date} {new_time}",
                author=rescheduled_by
            )

            return {"success": True, "new_date": new_date, "new_time": new_time}

        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def cancel_interview(cls, interview_id: str, reason: str, cancelled_by: str) -> Dict[str, Any]:
        """Cancel an interview"""
        try:
            doc_ref = db.collection("interviews").document(interview_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {"success": False, "error": "Interview not found"}

            interview_data = doc.to_dict()

            # Update interview status
            updates = {
                'status': InterviewStatus.CANCELLED.value,
                'cancelledBy': cancelled_by,
                'cancelledAt': datetime.now().isoformat(),
                'cancellationReason': reason
            }

            doc_ref.update(updates)

            # Clear scheduled interview from candidate
            candidate_updates = {'scheduledInterview': None}
            db.collection("candidates").document(
                interview_data['candidateId']).update(candidate_updates)

            # Add cancellation note
            cls.add_interview_note(
                interview_id=interview_id,
                note_text=f"Interview cancelled. Reason: {reason}",
                author=cancelled_by
            )

            return {"success": True, "status": InterviewStatus.CANCELLED.value}

        except Exception as e:
            return {"success": False, "error": str(e)}

    # Private helper methods
    @classmethod
    def _enrich_interview_data(cls, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich interview data with candidate information"""
        try:
            candidate_id = interview_data.get('candidateId')
            if candidate_id:
                candidate_doc = db.collection(
                    "candidates").document(candidate_id).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    interview_data['candidate'] = {
                        'id': candidate_id,
                        'name': candidate_data.get('name'),
                        'position': candidate_data.get('position'),
                        'email': candidate_data.get('email'),
                        'currentStage': candidate_data.get('currentStage')
                    }

            return interview_data

        except Exception as e:
            print(f"Error enriching interview data: {str(e)}")
            return interview_data

    @classmethod
    def _generate_interview_report(cls, interview_id: str, interview_data: Dict[str, Any], evaluation: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate a comprehensive interview report"""
        try:
            report_id = f"report_{interview_id}"

            # Build AI analysis from evaluation or messages
            ai_analysis = cls._analyze_interview_performance(
                interview_data, evaluation)

            report_data = {
                'id': report_id,
                'interviewId': interview_id,
                'candidateId': interview_data['candidateId'],
                'interviewer': interview_data.get('interviewer', {}),
                'date': interview_data['date'],
                'duration': interview_data.get('duration', 0),
                'quickLabels': cls._extract_quick_labels(interview_data),
                'quickNotes': cls._convert_notes_format(interview_data.get('notes', [])),
                'aiAnalysis': ai_analysis
            }

            # Save the report
            db.collection("interview_reports").document(
                report_id).set(report_data)

            return {"success": True, "report_id": report_id}

        except Exception as e:
            print(f"Error generating interview report: {str(e)}")
            return {"success": False, "error": str(e)}

    @classmethod
    def _analyze_interview_performance(cls, interview_data: Dict[str, Any], evaluation: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze interview performance and generate insights"""
        try:
            # Default analysis structure
            analysis = {
                'confidence': 0.8,
                'overallScore': 75.0,
                'strengths': [],
                'concerns': [],
                'keyHighlights': [],
                'resumeMatches': {'matching': [], 'discrepancies': []}
            }

            # Use evaluation data if provided
            if evaluation:
                analysis['overallScore'] = evaluation.get('overallScore', 75.0)
                analysis['strengths'] = evaluation.get('strengths', [])
                analysis['concerns'] = evaluation.get('weaknesses', [])

            # Analyze messages for additional insights
            messages = interview_data.get('messages', [])
            if messages:
                # Count question/answer interactions
                questions = [m for m in messages if m.get(
                    'type') == 'question']
                answers = [m for m in messages if m.get('type') == 'answer']

                analysis['keyHighlights'].append({
                    'type': 'neutral',
                    'point': f'Interview included {len(questions)} questions and {len(answers)} responses',
                    'confidence': 0.9
                })

                # Analyze response quality (simplified)
                high_rated_answers = [
                    m for m in answers if m.get('rating', 0) >= 4]
                if high_rated_answers:
                    analysis['strengths'].append('Strong technical responses')

            # Add duration-based insights
            duration = interview_data.get('duration', 0)
            if duration > 60:
                analysis['keyHighlights'].append({
                    'type': 'positive',
                    'point': 'Extended interview duration indicates thorough evaluation',
                    'confidence': 0.7
                })

            return analysis

        except Exception as e:
            print(f"Error analyzing interview performance: {str(e)}")
            return {'confidence': 0.5, 'overallScore': 50.0, 'strengths': [], 'concerns': []}

    @classmethod
    def _extract_quick_labels(cls, interview_data: Dict[str, Any]) -> List[str]:
        """Extract quick labels from interview data"""
        labels = []

        # Based on interview type
        interview_type = interview_data.get('type', '')
        if interview_type:
            labels.append(f"{interview_type.title()} Interview")

        # Based on outcome
        outcome = interview_data.get('outcome')
        if outcome == 'pass':
            labels.append('Passed')
        elif outcome == 'fail':
            labels.append('Needs Improvement')

        # Based on duration
        duration = interview_data.get('duration', 0)
        if duration >= 60:
            labels.append('Comprehensive')
        elif duration >= 30:
            labels.append('Standard')

        return labels

    @classmethod
    def _convert_notes_format(cls, notes: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Convert notes to the expected format for reports"""
        converted = []
        for note in notes:
            converted.append({
                'text': note.get('text', ''),
                'timestamp': note.get('timestamp', '')
            })
        return converted
