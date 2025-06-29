"""
Recruitment Workflow State Machine

Defines valid state transitions and available actions for each recruitment stage.
"""

from typing import Dict, List, Set, Tuple
from models import RecruitmentStage, CandidateAction


class WorkflowStateMachine:
    """Manages recruitment workflow state transitions and action validation"""

    # Define valid transitions: current_stage -> [(action, next_stage), ...]
    TRANSITIONS: Dict[RecruitmentStage, List[Tuple[CandidateAction, RecruitmentStage]]] = {

        RecruitmentStage.APPLIED: [
            (CandidateAction.SHORTLIST, RecruitmentStage.SCREENING),
            (CandidateAction.REJECT, RecruitmentStage.REJECTED),
            (CandidateAction.PUT_ON_HOLD, RecruitmentStage.ON_HOLD),
            (CandidateAction.VIEW_PROFILE,
             RecruitmentStage.APPLIED),  # No state change
            (CandidateAction.ANALYZE_RESUME,
             RecruitmentStage.APPLIED),  # No state change
        ],

        RecruitmentStage.SCREENING: [
            (CandidateAction.SCHEDULE_INTERVIEW,
             RecruitmentStage.INTERVIEW_SCHEDULED),
            (CandidateAction.REJECT_AFTER_SCREENING, RecruitmentStage.REJECTED),
            (CandidateAction.PUT_ON_HOLD, RecruitmentStage.ON_HOLD),
            (CandidateAction.UPDATE_SCREENING_NOTES,
             RecruitmentStage.SCREENING),  # No state change
        ],

        RecruitmentStage.INTERVIEW_SCHEDULED: [
            (CandidateAction.START_INTERVIEW, RecruitmentStage.INTERVIEWING),
            # No state change
            (CandidateAction.RESCHEDULE, RecruitmentStage.INTERVIEW_SCHEDULED),
            (CandidateAction.CANCEL_AND_REJECT, RecruitmentStage.REJECTED),
            (CandidateAction.REMIND_CANDIDATE,
             RecruitmentStage.INTERVIEW_SCHEDULED),  # No state change
        ],

        RecruitmentStage.INTERVIEWING: [
            (CandidateAction.COMPLETE_INTERVIEW,
             RecruitmentStage.INTERVIEW_COMPLETED),
            (CandidateAction.PAUSE_INTERVIEW,
             RecruitmentStage.INTERVIEWING),  # No state change
            (CandidateAction.CANCEL_INTERVIEW,
             RecruitmentStage.INTERVIEW_SCHEDULED),
        ],

        RecruitmentStage.INTERVIEW_COMPLETED: [
            (CandidateAction.MOVE_TO_FINAL_REVIEW, RecruitmentStage.FINAL_REVIEW),
            (CandidateAction.REQUEST_ANOTHER_INTERVIEW,
             RecruitmentStage.ADDITIONAL_INTERVIEW),
            (CandidateAction.REJECT_AFTER_INTERVIEW, RecruitmentStage.REJECTED),
            (CandidateAction.UPDATE_INTERVIEW_NOTES,
             RecruitmentStage.INTERVIEW_COMPLETED),  # No state change
        ],

        RecruitmentStage.ADDITIONAL_INTERVIEW: [
            (CandidateAction.SCHEDULE_NEXT_INTERVIEW,
             RecruitmentStage.INTERVIEW_SCHEDULED),
            (CandidateAction.REJECT, RecruitmentStage.REJECTED),
            (CandidateAction.SKIP_ADDITIONAL, RecruitmentStage.FINAL_REVIEW),
        ],

        RecruitmentStage.FINAL_REVIEW: [
            (CandidateAction.EXTEND_OFFER, RecruitmentStage.OFFER_EXTENDED),
            (CandidateAction.FINAL_REJECT, RecruitmentStage.REJECTED),
            (CandidateAction.PUT_ON_HOLD_FOR_REVIEW, RecruitmentStage.ON_HOLD),
            (CandidateAction.COMPARE_CANDIDATES,
             RecruitmentStage.FINAL_REVIEW),  # No state change
        ],

        RecruitmentStage.OFFER_EXTENDED: [
            (CandidateAction.OFFER_ACCEPTED, RecruitmentStage.HIRED),
            (CandidateAction.OFFER_DECLINED, RecruitmentStage.REJECTED),
            (CandidateAction.NEGOTIATE_OFFER, RecruitmentStage.NEGOTIATING),
            (CandidateAction.WITHDRAW_OFFER, RecruitmentStage.REJECTED),
        ],

        RecruitmentStage.NEGOTIATING: [
            (CandidateAction.UPDATE_OFFER, RecruitmentStage.OFFER_EXTENDED),
            (CandidateAction.NEGOTIATION_FAILED, RecruitmentStage.REJECTED),
            (CandidateAction.ACCEPT_COUNTER_OFFER, RecruitmentStage.HIRED),
        ],

        RecruitmentStage.ON_HOLD: [
            (CandidateAction.REACTIVATE, None),  # Return to previous state
            (CandidateAction.REJECT_FROM_HOLD, RecruitmentStage.REJECTED),
            (CandidateAction.UPDATE_HOLD_REASON,
             RecruitmentStage.ON_HOLD),  # No state change
        ],

        # Terminal stages - no transitions allowed
        RecruitmentStage.HIRED: [],
        RecruitmentStage.REJECTED: [],
    }

    # Backward compatibility mappings
    STAGE_ALIASES = {
        "screened": RecruitmentStage.SCREENING,
        "interviewed": RecruitmentStage.INTERVIEW_COMPLETED,
        "shortlisted": RecruitmentStage.FINAL_REVIEW,
    }

    ACTION_ALIASES = {
        "make-offer": CandidateAction.EXTEND_OFFER,
        "move-to-final": CandidateAction.MOVE_TO_FINAL_REVIEW,
    }

    @classmethod
    def get_available_actions(cls, current_stage: RecruitmentStage) -> List[CandidateAction]:
        """Get all available actions for a given stage"""
        # Handle backward compatibility
        if isinstance(current_stage, str):
            current_stage = cls.STAGE_ALIASES.get(current_stage, current_stage)

        transitions = cls.TRANSITIONS.get(current_stage, [])
        return [action for action, _ in transitions]

    @classmethod
    def get_next_stage(cls, current_stage: RecruitmentStage, action: CandidateAction) -> RecruitmentStage:
        """Get the next stage for a given current stage and action"""
        # Handle backward compatibility
        if isinstance(current_stage, str):
            current_stage = cls.STAGE_ALIASES.get(current_stage, current_stage)
        if isinstance(action, str):
            action = cls.ACTION_ALIASES.get(action, action)

        transitions = cls.TRANSITIONS.get(current_stage, [])
        for valid_action, next_stage in transitions:
            if valid_action == action:
                return next_stage

        raise ValueError(
            f"Invalid action '{action}' for stage '{current_stage}'")

    @classmethod
    def is_valid_transition(cls, current_stage: RecruitmentStage, action: CandidateAction) -> bool:
        """Check if an action is valid for the current stage"""
        try:
            cls.get_next_stage(current_stage, action)
            return True
        except ValueError:
            return False

    @classmethod
    def is_terminal_stage(cls, stage: RecruitmentStage) -> bool:
        """Check if a stage is terminal (no more transitions possible)"""
        return stage in [RecruitmentStage.HIRED, RecruitmentStage.REJECTED]

    @classmethod
    def get_stage_description(cls, stage: RecruitmentStage) -> str:
        """Get human-readable description of a stage"""
        descriptions = {
            RecruitmentStage.APPLIED: "Application received",
            RecruitmentStage.SCREENING: "Resume review and phone screening",
            RecruitmentStage.INTERVIEW_SCHEDULED: "Interview scheduled",
            RecruitmentStage.INTERVIEWING: "Interview in progress",
            RecruitmentStage.INTERVIEW_COMPLETED: "Interview completed, awaiting evaluation",
            RecruitmentStage.ADDITIONAL_INTERVIEW: "Additional interview required",
            RecruitmentStage.FINAL_REVIEW: "Final decision making",
            RecruitmentStage.OFFER_EXTENDED: "Job offer extended",
            RecruitmentStage.NEGOTIATING: "Salary/terms negotiation",
            RecruitmentStage.ON_HOLD: "Process paused",
            RecruitmentStage.HIRED: "Successfully hired",
            RecruitmentStage.REJECTED: "Application rejected",
        }
        return descriptions.get(stage, str(stage))

    @classmethod
    def get_action_description(cls, action: CandidateAction) -> str:
        """Get human-readable description of an action"""
        descriptions = {
            # Applied stage
            CandidateAction.SHORTLIST: "Move to screening",
            CandidateAction.REJECT: "Reject application",
            CandidateAction.PUT_ON_HOLD: "Put on hold",
            CandidateAction.VIEW_PROFILE: "View candidate profile",
            CandidateAction.ANALYZE_RESUME: "Analyze resume with AI",

            # Screening stage
            CandidateAction.SCHEDULE_INTERVIEW: "Schedule interview",
            CandidateAction.REJECT_AFTER_SCREENING: "Reject after screening",
            CandidateAction.UPDATE_SCREENING_NOTES: "Update screening notes",

            # Interview stages
            CandidateAction.START_INTERVIEW: "Start interview",
            CandidateAction.COMPLETE_INTERVIEW: "Complete interview",
            CandidateAction.RESCHEDULE: "Reschedule interview",

            # Final stages
            CandidateAction.EXTEND_OFFER: "Extend job offer",
            CandidateAction.OFFER_ACCEPTED: "Offer accepted",
            CandidateAction.FINAL_REJECT: "Final rejection",
        }
        return descriptions.get(action, str(action).replace("_", " ").title())

    @classmethod
    def get_stage_color(cls, stage: RecruitmentStage) -> str:
        """Get color code for UI display"""
        colors = {
            RecruitmentStage.APPLIED: "blue",
            RecruitmentStage.SCREENING: "yellow",
            RecruitmentStage.INTERVIEW_SCHEDULED: "orange",
            RecruitmentStage.INTERVIEWING: "purple",
            RecruitmentStage.INTERVIEW_COMPLETED: "indigo",
            RecruitmentStage.ADDITIONAL_INTERVIEW: "pink",
            RecruitmentStage.FINAL_REVIEW: "amber",
            RecruitmentStage.OFFER_EXTENDED: "emerald",
            RecruitmentStage.NEGOTIATING: "teal",
            RecruitmentStage.ON_HOLD: "gray",
            RecruitmentStage.HIRED: "green",
            RecruitmentStage.REJECTED: "red",
        }
        return colors.get(stage, "gray")


# Export convenience functions
def get_available_actions(stage: RecruitmentStage) -> List[CandidateAction]:
    """Get available actions for a stage"""
    return WorkflowStateMachine.get_available_actions(stage)


def perform_transition(current_stage: RecruitmentStage, action: CandidateAction) -> RecruitmentStage:
    """Perform a state transition"""
    return WorkflowStateMachine.get_next_stage(current_stage, action)


def is_valid_action(stage: RecruitmentStage, action: CandidateAction) -> bool:
    """Check if action is valid for stage"""
    return WorkflowStateMachine.is_valid_transition(stage, action)
