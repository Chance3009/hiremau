from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

from sub_agents.interview.agent import interview_agent

root_agent = Agent(
    name="root_agent",
    model="gemini-2.0-flash-exp",
    instruction="""
        You are the HR coordinator.

        Delegate tasks to:
        - interview_agent
        - document_analysis_agent
        - sourcing_agent
        - database_agent

        Never respond yourself.
    """,
    tools=[
        AgentTool(interview_agent),
        
    ]
)
