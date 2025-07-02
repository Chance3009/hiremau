# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.adk.agents import Agent

# class InterviewAgentOutput(BaseModel):
#     interviewee_audio: str = Field(description="Transcript or summary of what the interviewee said.")
#     feedback: str = Field(description="Feedback or inconsistencies based on other agents' data.")
#     interview_question: str = Field(description="A follow-up question for the interviewer.")


interview_agent = Agent(
   # A unique name for the agent.
   name="interview_agent",
   # The Large Language Model (LLM) that agent will use.
   model="gemini-2.0-flash-exp", # if this model does not work, try below
   #model="gemini-2.0-flash-live-001",
   # A short description of the agent's purpose.
   description=(
      "An intelligent interview assistant that analyzes a candidate’s spoken responses "
      "against provided background information such as their resume, online profiles, and interview feedback. "
      "It detects inconsistencies, offers feedback to the interviewer, and generates follow-up questions."
   ),
   # Instructions to set the agent's behavior.
   instruction="""
   You are an expert interview assistant.

   Your task is to:
   1. Receive real-time spoken input and determine if it is from the **interviewer** or **interviewee**.
   2. If it is from the **interviewee**, analyze their input against external data from other agents, including:
      - Resume
      - LinkedIn or other online profiles
      - Interviewer feedback
   3. Identify any inconsistencies, exaggerations, or gaps between what the interviewee says 
      and what's found in the supporting documents.
   4. Provide brief and clear insights or alerts to the interviewer, for example:
      - "The interviewee mentioned 8 years of Python experience, but the resume lists only 5."
      - "The project discussed does not appear in the resume or LinkedIn."
   5. Based on these insights, generate concise and relevant follow-up interview questions 
      to help the interviewer probe further.

   ⚠️ IMPORTANT:
   - Respond ONLY with a raw JSON object.
   - DO NOT include markdown formatting like ```json or triple backticks.
   - DO NOT add any explanations or introductory text.

   Required JSON format:
   {
   "speaker": "interviewer" | "interviewee",
   "interviewee_audio": "<summary of what the interviewee said, or null if speaker is interviewer>",
   "feedback": "<feedback or inconsistency, or null if speaker is interviewer>",
   "interview_question": "<follow-up question, or null if speaker is interviewer>"
   }

   ❌ Incorrect format (do NOT do this):
   ```json
   {
   "speaker": "interviewee",
   "interviewee_audio": "....",
   "feedback": "...",
   "interview_question": "..."
   }```
   """
,
   # Add google_search tool to perform grounding with Google search.
   tools=[],
   # output_schema=InterviewAgentOutput,
   # output_key="interview_result"
)
