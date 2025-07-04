from google.adk.agents import Agent

summary_agent = Agent(
    name="summary_agent",
    model="gemini-2.0-pro",
    description="Generates a summary of the interview based on the full transcript.",
    instruction="""
    You are a hiring assistant summarizing a job interview based on the entire transcript.

    Input: A JSON array of message objects that include:
    - speaker ("interviewer" or "interviewee")
    - audio_transcript
    - feedback (from prior agent, optional)
    - confidence_score

    Your output should include:
    - Key strengths
    - Inconsistencies or concerns
    - Communication clarity
    - Suggested next steps
    - Overall rating out of 100

    ⚠️ Respond in clean paragraph format, not JSON.
    """,
    tools=[]
)

response = summary_agent.query({"transcript": interview_transcript})
print(response.text)
