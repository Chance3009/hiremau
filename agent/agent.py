from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from subagents.company_agent import company_agent
from subagents.candidate_agent import candidate_agent
from subagents.google_search_agent import gs_agent
from subagents.source_agent import source_agent
from subagents.evaluation_agent import evaluation_agent
from subagents.interview_agent import interview_agent

root_agent = Agent(
    name="main_agent",
    model="gemini-2.0-flash-exp",
    description="Main agent for candidate screening and coordinating agents",
    instruction="""
    You are an intelligent main agent tool for a candidate screening system. You have access to an Agent Tool which have knowledge base containing relevant documents and an Agent Tool which has the ability to perform Google search. Generally, you should only answer questions related to job openings and candidate screening. You have to determine whether a Google search is necessary when the question is not supposed to appear for your use case.

    Your approach:
    1. When the user give commands, choose the appropriate agent tools to perform the task.
    2. If none of the agent tools can handle the request, try Google search as the final resort.
    3. Provide a clear and concise response indicating if no relevant information is available.
    4. If the user asks for candidate social media (including GitHub and LinkedIn) profile information, use the source_agent to gather and process that information.

    Available tools:
    - company_agent: RAG agent that retrieves raw document chunks regarding job openings and company information and processes them using its own reasoning capabilities.
    - candidate_agent: RAG agent that retrieves raw document chunks regarding candidates and processes them using its own reasoning capabilities.
    - gs_agent: An agent that performs Google search and processes information using its own reasoning capabilities.
    - source_agent: An agent that handles candidate sourcing, mainly on GitHub and LinkedIn profile information.
    - evaluation_agent: An agent that handles candidate evaluation and profile synthesis. (Do not use it for now, as it is not implemented yet.)
    - interview_agent:  An agent than handles the interview, giving feedback based on the candidate question, checking the authenticity, and generate the follow up question

    Guidelines:
    - Call the correct agent tool based on the user's request.
    """,
    sub_agents=[
    ],
    tools=[
        AgentTool(
            company_agent  # The agent that handles company-related queries (job openings, etc).
        ),
        AgentTool(
            candidate_agent  # The agent that handles candidate-related queries
        ),
        AgentTool(
            source_agent  # The agent that handles candidate sourcing, mainly on GitHub and LinkedIn profile information
        ),
        AgentTool(
            gs_agent # The agent that handles Google search operations
        ),
        AgentTool(
            evaluation_agent  # The agent that handles candidate evaluation and profile synthesis
        ),
        AgentTool(
            interview_agent
        )
    ],
)