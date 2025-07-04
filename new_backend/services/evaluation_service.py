import os
import requests
import logging
from typing import Dict, Any, Optional
from supabase_client import supabase
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class EvaluationService:
    def __init__(self):
        self.agent_url = "http://localhost:8000/add-doc"  # Agent service URL

    async def trigger_candidate_evaluation(self, candidate_id: str, resume_url: str, candidate_name: str, job_id: str = "") -> Dict[str, Any]:
        """
        Trigger evaluation for a candidate by sending resume to the agent system
        """
        try:
            # Step 1: Send resume to agent for processing and evaluation
            # Format payload as expected by the agent
            agent_payload = {
                "name": candidate_name,
                "url": resume_url,
                "uuid": candidate_id
            }

            logger.info(
                f"Sending candidate {candidate_name} to agent for evaluation")
            logger.info(f"Agent payload: {agent_payload}")

            # Call the agent service
            response = requests.post(
                self.agent_url,
                json=agent_payload,
                headers={"Content-Type": "application/json"},
                timeout=60  # Increased timeout for agent processing
            )

            if response.status_code != 200:
                logger.error(
                    f"Agent service failed: {response.status_code} - {response.text}")
                return {"success": False, "error": f"Agent service failed: {response.status_code}"}

            agent_response = response.json()
            logger.info(f"Agent response: {agent_response}")

            # Step 2: Process the agent response and extract evaluation data
            if agent_response.get("response"):
                # The agent should return structured evaluation data
                evaluation_result = await self._process_agent_response(
                    candidate_id,
                    candidate_name,
                    agent_response["response"],
                    job_id
                )

                if evaluation_result["success"]:
                    return {
                        "success": True,
                        "agent_response": agent_response,
                        "evaluation_id": evaluation_result.get("evaluation_id"),
                        "message": "Evaluation completed successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": evaluation_result.get("error", "Failed to process evaluation"),
                        "agent_response": agent_response
                    }
            else:
                return {
                    "success": False,
                    "error": "No response from agent",
                    "agent_response": agent_response
                }

        except Exception as e:
            logger.error(f"Error triggering evaluation: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _process_agent_response(self, candidate_id: str, candidate_name: str, agent_response: str, job_id: str = "") -> Dict[str, Any]:
        """Process the agent response and save to initial_screening_evaluation"""
        try:
            # Parse the agent response (assuming it's structured text or JSON)
            # For now, we'll create a basic evaluation structure
            # You may need to adjust this based on the actual agent response format

            evaluation_data = {
                "candidate_id": candidate_id,
                "candidate_name": candidate_name,
                "position_applied": job_id or "General Application",
                "evaluation_date": datetime.utcnow().isoformat(),
                "resume_summary": agent_response[:500] if len(agent_response) > 500 else agent_response,
                "years_of_experience": 0,  # Extract from agent response
                "education_background": "To be extracted from resume",
                "career_progression": "To be analyzed",
                "technical_skills": "To be extracted from resume",
                "software_proficiency": "To be analyzed",
                "industry_knowledge": "To be assessed",
                "soft_skills_claimed": "To be identified",
                "certifications": "To be extracted",
                "technical_competency_assessment": "Pending detailed analysis",
                "experience_relevance": "To be evaluated against job requirements",
                "communication_assessment": "Based on resume quality and structure",
                "standout_qualities": "To be identified from resume",
                "potential_concerns": "To be identified during screening",
                "strengths": "To be analyzed from experience and skills",
                "weaknesses": "To be identified during evaluation",
                "red_flags": "None identified initially",
                "growth_potential": "To be assessed",
                "cultural_fit_indicators": "To be evaluated during interview",
                "missing_required_skills": "To be compared against job requirements",
                "transferable_skills": "To be identified",
                "learning_curve_assessment": "To be evaluated",
                "recommendation": "Interview",  # Default recommendation
                "recommendation_reasoning": f"Initial processing completed. Full evaluation: {agent_response[:200]}...",
                "interview_focus_areas": "Technical skills, experience depth, cultural fit",
            }

            # Save to database
            save_result = await self.save_initial_screening_evaluation(candidate_id, evaluation_data)
            return save_result

        except Exception as e:
            logger.error(f"Error processing agent response: {str(e)}")
            return {"success": False, "error": str(e)}

    async def save_initial_screening_evaluation(self, candidate_id: str, evaluation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save the initial screening evaluation to the database
        """
        try:
            # Insert into initial_screening_evaluation table
            result = supabase.table("initial_screening_evaluation").insert(
                evaluation_data).execute()

            if result.data:
                logger.info(
                    f"Initial screening evaluation saved for candidate {candidate_id}")
                return {"success": True, "evaluation_id": result.data[0]["id"]}
            else:
                logger.error(f"Failed to save evaluation: {result}")
                return {"success": False, "error": "Failed to save to database"}

        except Exception as e:
            logger.error(f"Error saving evaluation: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_candidate_evaluation(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the evaluation data for a candidate
        """
        try:
            result = supabase.table("initial_screening_evaluation").select(
                "*").eq("candidate_id", candidate_id).execute()

            if result.data:
                return result.data[0]
            return None

        except Exception as e:
            logger.error(f"Error getting evaluation: {str(e)}")
            return None

    async def process_candidate_evaluation_async(self, candidate_id: str, resume_url: str, candidate_name: str, job_id: str = ""):
        """
        Async method to process candidate evaluation (can be called as background task)
        """
        try:
            logger.info(
                f"Starting async evaluation for candidate {candidate_id}")

            # Step 1: Trigger evaluation with agent
            evaluation_result = await self.trigger_candidate_evaluation(
                candidate_id,
                resume_url,
                candidate_name,
                job_id
            )

            if evaluation_result["success"]:
                logger.info(
                    f"Evaluation completed successfully for candidate {candidate_id}")
                logger.info(
                    f"Evaluation ID: {evaluation_result.get('evaluation_id')}")
            else:
                logger.error(
                    f"Evaluation failed for candidate {candidate_id}: {evaluation_result.get('error')}")

        except Exception as e:
            logger.error(f"Error in async evaluation process: {str(e)}")


# Create a singleton instance
evaluation_service = EvaluationService()
