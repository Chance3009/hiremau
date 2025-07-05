import os
import google.generativeai as genai
from typing import Dict, Any, Optional
import json
import logging
from .base import BaseService
from models import CandidateAIAnalysis, CandidateAIAnalysisCreate

logger = logging.getLogger(__name__)


class AgentService(BaseService):
    def __init__(self):
        super().__init__()
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.model = None
            return

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def analyze_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Analyze a candidate using Gemini AI"""
        if not self.model:
            raise Exception("Gemini AI not configured")

        try:
            # Get candidate data
            result = await self.supabase.table('candidates').select('*').eq('id', candidate_id).single().execute()
            candidate = result.data if result.data else {}

            # Get resume text if available
            resume_result = await self.supabase.table('candidate_files')\
                .select('extracted_text')\
                .eq('candidate_id', candidate_id)\
                .eq('file_type', 'resume')\
                .single()\
                .execute()
            resume_text = resume_result.data.get(
                'extracted_text') if resume_result.data else None

            # Prepare candidate information for analysis
            prompt = f"""
            Analyze this candidate profile and provide detailed insights.
            
            Candidate Information:
            Name: {candidate.get('name', 'Unknown')}
            Current Position: {candidate.get('current_position', 'Not specified')}
            Years Experience: {candidate.get('years_experience', 0)}
            Education: {candidate.get('education', 'Not specified')}
            Skills: {', '.join(candidate.get('skills', []))}
            
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

            # Generate analysis
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean the response
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]

            # Parse and validate
            try:
                analysis = json.loads(response_text)

                # Ensure all required fields are present
                required_fields = ['overallMatch', 'skillMatches',
                                   'cultureFit', 'growthPotential', 'riskFactors', 'insights']
                for field in required_fields:
                    if field not in analysis:
                        analysis[field] = [] if field in [
                            'skillMatches', 'riskFactors', 'insights'] else 0

                # Store analysis in database
                await self.supabase.table('candidate_ai_analysis').insert({
                    'candidate_id': candidate_id,
                    'analysis_json': analysis,
                    'model_version': 'gemini-pro-v1'
                }).execute()

                return analysis

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Gemini response: {e}")
                logger.error(f"Response text: {response_text}")
                raise Exception("Failed to parse AI analysis")

        except Exception as e:
            logger.error(f"Error in candidate analysis: {str(e)}")
            raise Exception(f"Failed to analyze candidate: {str(e)}")

    async def extract_resume_text(self, resume_text: str) -> Dict[str, Any]:
        """Extract structured information from resume text"""
        if not self.model:
            raise Exception("Gemini AI not configured")

        try:
            prompt = f"""
            Extract structured information from this resume text. Return as JSON:
            {{
                "skills": ["array of technical and soft skills"],
                "experience": [
                    {{
                        "title": "job title",
                        "company": "company name",
                        "duration": "duration in years",
                        "responsibilities": ["key responsibilities"]
                    }}
                ],
                "education": [
                    {{
                        "degree": "degree name",
                        "institution": "school name",
                        "year": "completion year"
                    }}
                ],
                "certifications": ["array of certifications"],
                "languages": ["array of languages"]
            }}

            Resume Text:
            {resume_text}

            Return only the JSON object, no additional text.
            """

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean and parse
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]

            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Error extracting resume information: {str(e)}")
            raise Exception(f"Failed to extract resume information: {str(e)}")


agent_service = AgentService()
