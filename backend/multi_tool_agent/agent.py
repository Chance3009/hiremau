from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

from .sub_agents.interview.agent import interview_agent


root_agent = Agent(
    name="master_agent",
    model="gemini-2.0-flash",
    description=(
        "Main controller agent that routes user requests to appropriate specialized agents"
    ),
    instruction=(
        """
        You are the HR system’s central coordinator. Your job is to understand the user’s request,
        determine which specialized agent or tool is needed, and call the appropriate function.

        Available tools:
        - `interview_agent` → For analyzing live interview responses
        - `document_analysis` → For analyzing resumes/CVs
        - `sourcing` → For web and background checks
        - `data_lookup` → For retrieving candidate profiles

        Instructions:
        - Do NOT analyze anything yourself.
        - Always call the correct tool.
        - If the user wants to analyze a live interview, use the `interview_agent` tool.
        - If the user wants to analyze a resume, use `document_analysis`.
        - If the request is unclear, ask the user to clarify.
        """
    ),
    tools=[AgentTool(interview_agent)],
)