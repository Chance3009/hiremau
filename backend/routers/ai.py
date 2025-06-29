from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai"])

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")
    model = None

# Pydantic models


class JobExtractionRequest(BaseModel):
    text: str


class SalaryInfo(BaseModel):
    min: str
    max: str
    currency: str
    period: str


class JobExtractionResponse(BaseModel):
    title: str
    department: str
    location: str
    description: str
    requirements: List[str]
    salary: Optional[SalaryInfo]
    employmentType: str
    experienceLevel: str
    benefits: List[str]


class SkillsSuggestionRequest(BaseModel):
    text: str


@router.post("/extract-job-details", response_model=JobExtractionResponse)
async def extract_job_details(request: JobExtractionRequest):
    """Extract structured job details from unstructured text using Gemini AI"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        # Create a comprehensive prompt for job extraction
        prompt = f"""
        Extract structured job information from the following job description text. Return the information as a JSON object with these exact fields:

        {{
            "title": "string - Job title",
            "department": "string - Department/team (e.g., Engineering, Marketing, Sales, etc.)",
            "location": "string - Work location (e.g., Remote, New York, Hybrid, etc.)",
            "description": "string - Clean, formatted job description",
            "requirements": ["array of strings - Key qualifications or expectations stated in full sentences (not keywords)"],
            "salary": {{
                "min": "string - minimum salary amount (numbers only)",
                "max": "string - maximum salary amount (numbers only)", 
                "currency": "string - currency code (e.g., MYR,USD, EUR)",
                "period": "string - period (year, month, hour)"
            }},
            "employmentType": "string - full-time, part-time, contract, internship, etc.",
            "experienceLevel": "string - entry-level, mid-level, senior, executive, etc.",
            "benefits": ["array of strings - Benefits and perks mentioned"]
        }}

        Rules:
        1. If salary information is not found, set salary to null
        2. Extract actual requirements, not just keywords
        3. Determine experience level from context (years of experience, seniority mentions)
        4. For location, include remote/hybrid options if mentioned
        5. Make the description clean and professional
        6. Only include benefits that are explicitly mentioned

        Job Description Text:
        {request.text}

        Return only the JSON object, no additional text:
        """

        # Generate content using Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean the response (remove markdown formatting if present)
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]

        # Parse JSON response
        try:
            extracted_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            raise HTTPException(
                status_code=500, detail="Failed to parse AI response")

        # Validate and clean the extracted data
        cleaned_data = {
            "title": extracted_data.get("title", "Untitled Position"),
            "department": extracted_data.get("department", "General"),
            "location": extracted_data.get("location", "Not specified"),
            "description": extracted_data.get("description", request.text[:500] + "..."),
            "requirements": extracted_data.get("requirements", []),
            "salary": extracted_data.get("salary"),
            "employmentType": extracted_data.get("employmentType", "full-time"),
            "experienceLevel": extracted_data.get("experienceLevel", "mid-level"),
            "benefits": extracted_data.get("benefits", [])
        }

        logger.info(
            f"Successfully extracted job details for: {cleaned_data['title']}")
        return JobExtractionResponse(**cleaned_data)

    except Exception as e:
        logger.error(f"Error in job extraction: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to extract job details: {str(e)}")


@router.post("/suggest-skills")
async def suggest_skills(request: SkillsSuggestionRequest):
    """Suggest additional skills and requirements based on job description"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        prompt = f"""
        Based on the following job description, suggest 8-12 relevant technical skills, tools, and qualifications that would be valuable for this role. 
        
        Return only a JSON array of strings (skills), no additional text:
        ["skill1", "skill2", "skill3", ...]
        
        Focus on:
        - Technical skills and tools
        - Programming languages (if applicable)
        - Frameworks and libraries
        - Soft skills relevant to the role
        - Industry-specific knowledge
        
        Job Description:
        {request.text}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean the response
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]

        # Parse JSON response
        try:
            skills = json.loads(response_text)
            if not isinstance(skills, list):
                skills = []
        except json.JSONDecodeError:
            # Fallback to basic skills if parsing fails
            skills = ["Communication", "Problem Solving",
                      "Team Collaboration", "Time Management"]

        return {"skills": skills}

    except Exception as e:
        logger.error(f"Error in skills suggestion: {str(e)}")
        # Return fallback skills instead of error
        return {
            "skills": [
                "Communication", "Problem Solving", "Team Collaboration",
                "Time Management", "Analytical Thinking", "Adaptability"
            ]
        }


@router.post("/summary")
def ai_summary(data: dict):
    # TODO: Implement AI summary endpoint
    return {"summary": "AI summary not implemented"}


@router.post("/evaluate")
def ai_evaluate(data: dict):
    # TODO: Implement AI evaluation endpoint
    return {"evaluation": "AI evaluation not implemented"}


@router.post("/enrich-candidate")
async def enrich_candidate_profile(candidate_data: dict):
    """
    Enrich candidate profile using the ADK agent service

    This endpoint triggers the external agent service to gather
    comprehensive candidate data from LinkedIn, GitHub, and personal websites
    """
    try:
        # Extract candidate information
        name = candidate_data.get("name", "")
        linkedin_url = candidate_data.get("linkedinUrl", "")
        github_username = candidate_data.get("githubUsername", "")
        website_url = candidate_data.get("websiteUrl", "")

        if not any([linkedin_url, github_username, website_url]):
            return {
                "success": False,
                "message": "At least one data source (LinkedIn, GitHub, or website) is required"
            }

        # In a real implementation, you would:
        # 1. Call the agent service API (when it has REST endpoints)
        # 2. Or trigger an async job queue (Celery/RQ)
        # 3. Or use direct ADK integration

        # For now, return a structured response indicating the process
        enrichment_request = {
            "candidateId": candidate_data.get("id"),
            "name": name,
            "sources": {
                "linkedin": linkedin_url if linkedin_url else None,
                "github": github_username if github_username else None,
                "website": website_url if website_url else None
            },
            "status": "queued",
            "message": "Candidate enrichment queued for processing by ADK agent service"
        }

        # TODO: Integrate with actual agent service
        # agent_result = await call_agent_service(enrichment_request)

        return {
            "success": True,
            "enrichmentRequest": enrichment_request,
            "note": "This endpoint will integrate with the ADK agent service for full automation"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing enrichment request: {str(e)}")


@router.get("/agent-status")
async def get_agent_service_status():
    """Check if the agent service is available and healthy"""
    try:
        # TODO: Implement health check for agent service
        # For now, return a placeholder response
        return {
            "status": "available",
            "service": "ADK Candidate Sourcing Agent",
            "version": "1.2.0+",
            "architecture": "ParallelAgent",
            "capabilities": [
                "LinkedIn profile enrichment",
                "GitHub repository analysis",
                "Website content extraction",
                "Parallel data synthesis"
            ],
            "note": "Agent service integration pending"
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "error": str(e)
        }

# Placeholder for agentic/AI logic (e.g., LLM, Vertex AI integration)
# def run_agent(...):
#     pass
