# agent.py
import asyncio
from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from .realtime_transcribe import run_realtime_interview

# Tool function
def verify_transcript(spoken_text: str, resume_summary: str, expected_script: str) -> dict:
    return {
        "match_score": 0.65,
        "discrepancy": True,
        "follow_up_question": "Can you elaborate more on your React experience?"
    }

# Register tool with ADK
verify_transcript_tool = AgentTool(
    name="verify_transcript",
    description="Verifies spoken transcript with resume and expected script",
    input_type=dict,
    output_type=dict,
    func=verify_transcript,
)

# Define the agent with the tool
interview_agent = Agent(
    name="interview_agent",
    model="gemini-2.0-flash",
    description="Analyzes spoken interview responses and suggests follow-up questions.",
    instruction=(
        "You analyze a candidate’s spoken response during an interview and:\n"
        "- Compare it with the expected script and resume\n"
        "- If there's a mismatch, suggest a question HR should ask next\n"
        "- If consistent, just confirm alignment\n"
        "Respond in structured and professional tone."
    ),
    tools=[verify_transcript_tool],
)

# Agent runner
def run_interview_analysis():
    print("🎤 Starting interview session...")
    try:
        asyncio.run(run_realtime_interview(interview_agent))
        return {"status": "done", "message": "Interview session completed."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = run_interview_analysis()
    print("✅ Agent test result:", result)
