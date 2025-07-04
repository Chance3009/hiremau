from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
from google.adk.agents import ParallelAgent, SequentialAgent

import asyncio
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from subagents.company_agent import company_agent
from subagents.candidate_agent import candidate_agent
from subagents.google_search_agent import gs_agent
from subagents.source_agent import source_agent
from subagents.candidate_sourcing.synthesizer_agent import synthesizer_agent
from subagents.evaluation_agent import evaluation_agent

load_dotenv()

app = Flask(__name__)
CORS(app)

APP_NAME = "hackatt"
USER_ID = "user_hackatt"
SESSION_ID = "session_1"

add_candidate_agent = SequentialAgent(
    name="add_candidate_agent",
    sub_agents=[candidate_agent, source_agent, synthesizer_agent],
)

# async def get_agent():
#     root_agent = Agent(
#         name="main_agent",
#         model="gemini-2.0-flash",
#         description="Main agent for candidate screening and coordinating agent tools",
#         instruction="""
#         You are an intelligent main agent tool for a candidate screening system. You have access to an Agent Tool which have knowledge base containing relevant documents and an Agent Tool which has the ability to perform Google search. Generally, you should only answer questions related to job openings and candidate screening. You have to determine whether a Google search is necessary when the question is not supposed to appear for your use case.

#         Your approach:
#         1. When the user give commands, choose the appropriate agent tools to perform the task.
#         2. If none of the agent tools can handle the request, try Google search as the final resort.
#         3. Provide a clear and concise response indicating if no relevant information is available.
#         4. If the user asks for candidate social media (including GitHub and LinkedIn) profile information, use the source_agent to gather and process that information.

#         Available tools:
#         - company_agent: RAG agent that retrieves raw document chunks regarding job openings and company information and processes them using its own reasoning capabilities.
#         - candidate_agent: RAG agent that retrieves raw document chunks regarding candidates and processes them using its own reasoning capabilities.
#         - gs_agent: An agent that performs Google search and processes information using its own reasoning capabilities.
#         - source_agent: An agent that handles candidate sourcing, mainly on GitHub and LinkedIn profile information.
#         - evaluation_agent: An agent that handles candidate evaluation and profile synthesis. (Do not use it for now, as it is not implemented yet.)

#         Guidelines:
#         - Call the correct agent tool based on the user's request.
#         """,
#         sub_agents=[
#         ],
#         tools=[
#             AgentTool(
#                 company_agent  # The agent that handles company-related queries (job openings, etc).
#             ),
#             AgentTool(
#                 candidate_agent  # The agent that handles candidate-related queries
#             ),
#             AgentTool(
#                 source_agent  # The agent that handles candidate sourcing, mainly on GitHub and LinkedIn profile information
#             ),
#             AgentTool(
#                 gs_agent # The agent that handles Google search operations
#             ),
#             AgentTool(
#                 evaluation_agent  # The agent that handles candidate evaluation and profile synthesis
#             ),
#         ],
#     )
#     return root_agent


async def get_agent():
    root_agent = Agent(
        name="main_agent",
        model="gemini-2.0-flash",
        description="Main agent for candidate screening and coordinating agent tools",
        instruction="You a are a helpful assistant. If you received a request with a JSON to add a candidate document, use the add_candidate_document tool to add the document to the database. The JSON should contain the name, url, and uuid of the document. Pass the JSON to the add_candidate_agent tool.",
        tools=[
            AgentTool(
                add_candidate_agent
            )
        ]
    )
    return root_agent


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'agent'})


@app.route('/add-doc', methods=['POST'])
def run_agent():
    data = request.get_json(force=True) or {}
    # The query will be the JSON payload itself
    query = str(data)
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(main(query))
        return jsonify({'response': response})
    except Exception as e:
        print(f"Error in agent: {str(e)}")
        return jsonify({'error': str(e)}), 500


async def main(query):
    session_serivce = InMemorySessionService()
    await session_serivce.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID)
    root_agent = await get_agent()
    runner = Runner(app_name=APP_NAME, agent=root_agent,
                    session_service=session_serivce)
    content = types.Content(role="user", parts=[types.Part(text=query)])
    print("Running agent with query:", query)
    events = runner.run_async(
        new_message=content,
        user_id=USER_ID,
        session_id=SESSION_ID,
    )
    final_response = None
    async for event in events:
        if event.is_final_response():
            final_response = event.content.parts[0].text
            print("Agent Response:", final_response)
    return final_response

# Remove the __main__ block and instead run the Flask app
if __name__ == "__main__":
    app.run(port=8000)
