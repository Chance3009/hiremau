from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from models import JobExtractionRequest, JobExtractionResponse, SkillsSuggestionRequest, SkillsSuggestionResponse
import google.generativeai as genai
import os
import json
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


@router.post("/suggest-skills", response_model=SkillsSuggestionResponse)
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

        return SkillsSuggestionResponse(skills=skills)

    except Exception as e:
        logger.error(f"Error in skills suggestion: {str(e)}")
        # Return fallback skills instead of error
        return SkillsSuggestionResponse(skills=[
            "Communication", "Problem Solving", "Team Collaboration",
            "Time Management", "Analytical Thinking", "Adaptability"
        ])


@router.post("/analyze-candidate")
async def analyze_candidate(candidate_data: Dict[str, Any]):
    """Analyze candidate profile and provide insights"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        # Extract relevant candidate information
        name = candidate_data.get("name", "Unknown")
        skills = candidate_data.get("skills", [])
        experience = candidate_data.get("work_experience", [])
        education = candidate_data.get("education", [])
        position_applied = candidate_data.get("position_id", "Unknown")

        prompt = f"""
        Analyze the following candidate profile and provide insights:

        Candidate: {name}
        Position Applied: {position_applied}
        Skills: {', '.join(skills) if skills else 'Not specified'}
        Work Experience: {len(experience)} positions
        Education: {len(education)} degrees/certifications

        Please provide analysis in JSON format:
        {{
            "overall_assessment": "string - Overall assessment of the candidate",
            "strengths": ["array of strings - Key strengths"],
            "areas_for_improvement": ["array of strings - Areas that need improvement"],
            "skill_match_score": "number 0-100 - How well skills match the position",
            "experience_level": "string - Assessed experience level",
            "recommendations": ["array of strings - Specific recommendations"],
            "risk_factors": ["array of strings - Potential concerns"],
            "next_steps": ["array of strings - Recommended next steps"]
        }}

        Be objective and constructive in your analysis.
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
            analysis = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback analysis
            analysis = {
                "overall_assessment": "Unable to analyze candidate profile",
                "strengths": [],
                "areas_for_improvement": [],
                "skill_match_score": 50,
                "experience_level": "Unknown",
                "recommendations": ["Review profile manually"],
                "risk_factors": [],
                "next_steps": ["Schedule manual review"]
            }

        return {
            "candidate_id": candidate_data.get("id"),
            "analysis": analysis,
            "timestamp": "2024-01-01T00:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error analyzing candidate: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze candidate: {str(e)}")


@router.post("/compare-candidates")
async def compare_candidates(candidates_data: List[Dict[str, Any]]):
    """Compare multiple candidates for a position"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        if len(candidates_data) < 2:
            raise HTTPException(
                status_code=400, detail="Need at least 2 candidates to compare")

        # Prepare candidate information for comparison
        candidates_info = []
        for candidate in candidates_data:
            candidates_info.append({
                "name": candidate.get("name", "Unknown"),
                "skills": candidate.get("skills", []),
                "experience_years": candidate.get("experience_years", 0),
                "education": candidate.get("education", []),
                "ai_score": candidate.get("ai_score", 0)
            })

        prompt = f"""
        Compare the following candidates for a position and provide analysis:

        Candidates:
        {json.dumps(candidates_info, indent=2)}

        Please provide comparison in JSON format:
        {{
            "overall_comparison": "string - Overall comparison summary",
            "candidate_rankings": [
                {{
                    "name": "string",
                    "rank": "number 1-N",
                    "strengths": ["array of strings"],
                    "weaknesses": ["array of strings"],
                    "recommendation": "string"
                }}
            ],
            "key_differences": ["array of strings - Key differences between candidates"],
            "best_fit": "string - Name of best fitting candidate",
            "recommendations": ["array of strings - General recommendations"]
        }}

        Be objective and focus on relevant factors for the position.
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
            comparison = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback comparison
            comparison = {
                "overall_comparison": "Unable to compare candidates",
                "candidate_rankings": [],
                "key_differences": [],
                "best_fit": "Unknown",
                "recommendations": ["Review candidates manually"]
            }

        return {
            "comparison": comparison,
            "candidates_compared": len(candidates_data),
            "timestamp": "2024-01-01T00:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error comparing candidates: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to compare candidates: {str(e)}")


@router.post("/generate-interview-questions")
async def generate_interview_questions(job_data: Dict[str, Any], candidate_data: Dict[str, Any]):
    """Generate interview questions based on job requirements and candidate profile"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        job_title = job_data.get("title", "Unknown")
        job_requirements = job_data.get("requirements", [])
        candidate_skills = candidate_data.get("skills", [])
        interview_type = job_data.get("interview_type", "technical")

        prompt = f"""
        Generate interview questions for a {interview_type} interview.

        Job: {job_title}
        Job Requirements: {', '.join(job_requirements) if job_requirements else 'Not specified'}
        Candidate Skills: {', '.join(candidate_skills) if candidate_skills else 'Not specified'}

        Please provide questions in JSON format:
        {{
            "technical_questions": ["array of strings - Technical questions"],
            "behavioral_questions": ["array of strings - Behavioral questions"],
            "situational_questions": ["array of strings - Situational questions"],
            "skill_assessment": ["array of strings - Questions to assess specific skills"],
            "culture_fit": ["array of strings - Culture fit questions"],
            "recommended_duration": "number - Recommended interview duration in minutes",
            "focus_areas": ["array of strings - Areas to focus on during interview"]
        }}

        Generate 3-5 questions for each category. Questions should be relevant to the job and candidate profile.
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
            questions = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback questions
            questions = {
                "technical_questions": ["Tell me about your technical background"],
                "behavioral_questions": ["Describe a challenging project you worked on"],
                "situational_questions": ["How would you handle a difficult team member?"],
                "skill_assessment": ["What are your strongest technical skills?"],
                "culture_fit": ["What motivates you in your work?"],
                "recommended_duration": 60,
                "focus_areas": ["Technical skills", "Problem solving", "Team collaboration"]
            }

        return {
            "job_id": job_data.get("id"),
            "candidate_id": candidate_data.get("id"),
            "interview_type": interview_type,
            "questions": questions,
            "timestamp": "2024-01-01T00:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error generating interview questions: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate interview questions: {str(e)}")


@router.get("/agent-status")
async def get_agent_service_status():
    """Get the status of AI agent services"""
    return {
        "gemini_ai": "configured" if GEMINI_API_KEY else "not_configured",
        "services_available": {
            "job_extraction": bool(GEMINI_API_KEY),
            "skills_suggestion": bool(GEMINI_API_KEY),
            "candidate_analysis": bool(GEMINI_API_KEY),
            "candidate_comparison": bool(GEMINI_API_KEY),
            "interview_questions": bool(GEMINI_API_KEY)
        },
        "status": "operational" if GEMINI_API_KEY else "limited"
    }


@router.post("/enrich-candidate")
async def enrich_candidate_profile(candidate_data: Dict[str, Any]):
    """Enrich candidate profile with AI-generated insights"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        # Extract candidate information
        name = candidate_data.get("name", "Unknown")
        skills = candidate_data.get("skills", [])
        experience = candidate_data.get("work_experience", [])
        education = candidate_data.get("education", [])

        prompt = f"""
        Enrich the following candidate profile with additional insights and suggestions:

        Candidate: {name}
        Skills: {', '.join(skills) if skills else 'Not specified'}
        Work Experience: {len(experience)} positions
        Education: {len(education)} degrees/certifications

        Please provide enrichment in JSON format:
        {{
            "suggested_skills": ["array of strings - Additional skills to consider"],
            "career_path_suggestions": ["array of strings - Potential career paths"],
            "skill_gaps": ["array of strings - Identified skill gaps"],
            "development_recommendations": ["array of strings - Development recommendations"],
            "market_positioning": "string - How to position this candidate in the market",
            "salary_insights": "string - Salary insights based on profile",
            "industry_fit": ["array of strings - Industries this candidate would fit well in"]
        }}

        Provide constructive and actionable insights.
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
            enrichment = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback enrichment
            enrichment = {
                "suggested_skills": [],
                "career_path_suggestions": [],
                "skill_gaps": [],
                "development_recommendations": [],
                "market_positioning": "Unable to determine",
                "salary_insights": "Unable to determine",
                "industry_fit": []
            }

        return {
            "candidate_id": candidate_data.get("id"),
            "enrichment": enrichment,
            "timestamp": "2024-01-01T00:00:00Z"
        }

    except Exception as e:
        logger.error(f"Error enriching candidate profile: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to enrich candidate profile: {str(e)}")


@router.post("/analyze-application")
async def analyze_application(candidate_data: Dict[str, Any], resume_text: Optional[str] = None):
    """Analyze a new candidate application and provide comprehensive insights"""

    if not model:
        raise HTTPException(
            status_code=500, detail="Gemini AI not configured. Please set GEMINI_API_KEY environment variable.")

    try:
        # Prepare the analysis prompt
        prompt = f"""
        Analyze this candidate application and provide detailed insights.
        
        Candidate Information:
        Name: {candidate_data.get('name', 'Unknown')}
        Current Position: {candidate_data.get('current_position', 'Not specified')}
        Years Experience: {candidate_data.get('years_experience', 0)}
        Education: {candidate_data.get('education', 'Not specified')}
        Skills: {', '.join(candidate_data.get('skills', []))}
        
        {f"Resume Text: {resume_text}" if resume_text else ""}

        Provide analysis in the following JSON format:
        {{
            "overallMatch": "number between 0-100",
            "skillMatches": [
                {{
                    "skill": "string - skill name",
                    "score": "number between 0-100",
                    "required": "boolean",
                    "experience": "string - experience level"
                }}
            ],
            "cultureFit": "number between 0-100",
            "growthPotential": "number between 0-100",
            "riskFactors": [
                {{
                    "type": "string - risk area",
                    "severity": "string - low, medium, or high",
                    "description": "string - detailed description"
                }}
            ],
            "insights": [
                {{
                    "type": "string - strength, weakness, or opportunity",
                    "description": "string - detailed insight"
                }}
            ]
        }}

        Focus on:
        1. Skills assessment and potential
        2. Experience relevance
        3. Growth indicators
        4. Potential risks or gaps
        5. Cultural fit indicators
        
        Return only the JSON object, no additional text.
        """

        # Generate analysis using Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean the response
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]

        # Parse and validate the response
        try:
            analysis = json.loads(response_text)

            # Ensure all required fields are present
            required_fields = ['overallMatch', 'skillMatches',
                               'cultureFit', 'growthPotential', 'riskFactors', 'insights']
            for field in required_fields:
                if field not in analysis:
                    analysis[field] = [] if field in [
                        'skillMatches', 'riskFactors', 'insights'] else 0

            return analysis

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            logger.error(f"Response text: {response_text}")
            raise HTTPException(
                status_code=500, detail="Failed to parse AI analysis")

    except Exception as e:
        logger.error(f"Error in application analysis: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze application: {str(e)}")
