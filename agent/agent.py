from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
from google.adk.agents import ParallelAgent, SequentialAgent

import asyncio
import os
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

# Check required environment variables
required_env_vars = ["GOOGLE_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]

if missing_vars:
    print(
        f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
    print("Please create a .env file with the required variables. Check env_template.txt for the template.")
    print("Copy env_template.txt to .env and fill in your actual values.")

add_candidate_agent = SequentialAgent(
    name="add_candidate_agent",
    sub_agents=[candidate_agent, source_agent, synthesizer_agent],
)


async def get_agent():
    root_agent = Agent(
        name="main_agent",
        model="gemini-2.0-flash",
        description="Main agent for candidate screening and coordinating agent tools",
        instruction="You a are a helpful assistant. If you received a request with a JSON to add a candidate document, use the add_candidate_document tool to add the document to the database. The JSON should contain the name, url, and uuid of the document. Pass the JSON to the candidate_agent tool.",
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
    # Check environment variables first
    if missing_vars:
        return jsonify({
            'error': f'Missing required environment variables: {", ".join(missing_vars)}',
            'message': 'Please create a .env file with the required variables. Check env_template.txt for the template.'
        }), 500

    data = request.get_json(force=True) or {}
    # The query will be the JSON payload itself
    query = str(data)

    try:
        # Create a fresh event loop for this request
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            response = loop.run_until_complete(main(query))
            return jsonify({'response': response})
        except ConnectionError as e:
            print(f"Connection error: {str(e)}")
            return jsonify({
                'error': 'Connection error',
                'message': 'Failed to connect to external services. Please check your internet connection and API keys.',
                'details': str(e)
            }), 500
        except Exception as e:
            print(f"Error during execution: {str(e)}")
            return jsonify({
                'error': 'Execution error',
                'message': 'An error occurred while processing your request.',
                'details': str(e)
            }), 500
        finally:
            # Properly clean up all tasks and close the loop
            try:
                # Cancel all pending tasks
                pending = asyncio.all_tasks(loop)
                if pending:
                    for task in pending:
                        task.cancel()

                    # Wait for all tasks to complete cancellation
                    loop.run_until_complete(
                        asyncio.gather(*pending, return_exceptions=True)
                    )

                # Close the loop
                loop.close()
            except Exception as cleanup_error:
                print(f"Error during cleanup: {cleanup_error}")

    except Exception as e:
        print(f"Error in agent: {str(e)}")
        return jsonify({
            'error': 'Agent error',
            'message': 'An error occurred in the agent service.',
            'details': str(e)
        }), 500


async def main(query):
    try:
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
    except Exception as e:
        print(f"Error in main function: {str(e)}")
        raise e

# Remove the __main__ block and instead run the Flask app
if __name__ == "__main__":
    print("Starting HireMau Agent Service...")
    if missing_vars:
        print(
            f"WARNING: Missing environment variables: {', '.join(missing_vars)}")
        print("The agent will not function properly without these variables.")
    else:
        print("All required environment variables are set.")
    app.run(port=8000, debug=True)
