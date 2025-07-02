import os
import json
import base64
import re
import warnings
from pathlib import Path
from dotenv import load_dotenv

from google.genai.types import Blob
from google.adk.runners import InMemoryRunner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from interview_agent.agent import root_agent

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

# Load Gemini API Key
load_dotenv()

APP_NAME = "ADK Streaming example"

async def start_agent_session(user_id):
    """Starts an agent session"""
    runner = InMemoryRunner(
        app_name=APP_NAME,
        agent=root_agent,
    )
    session = await runner.session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
    )
    run_config = RunConfig(response_modalities=["TEXT"])
    live_request_queue = LiveRequestQueue()
    live_events = runner.run_live(
        session=session,
        live_request_queue=live_request_queue,
        run_config=run_config,
    )
    return live_events, live_request_queue

async def agent_to_client_sse(live_events):
    """Agent to client communication via SSE"""
    async for event in live_events:
        if event.turn_complete or event.interrupted:
            message = {
                "turn_complete": event.turn_complete,
                "interrupted": event.interrupted,
            }
            yield f"data: {json.dumps(message)}\n\n"
            print(f"[AGENT TO CLIENT]: {message}")
            continue

        part = event.content.parts[0] if event.content and event.content.parts else None

        if not (part and part.text and event.partial):
            continue

        # Sanitize the text to remove triple backticks and extra formatting
        cleaned_text = re.sub(r"^```(?:json)?\n|\n?```$", "", part.text.strip(), flags=re.MULTILINE)

        message = {
            "mime_type": "text/plain",
            "data": cleaned_text
        }
        yield f"data: {json.dumps(message)}\n\n"
        print(f"[AGENT TO CLIENT]: text/plain: {message}")

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path("static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
active_sessions = {}

@app.get("/")
async def root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/events/{user_id}")
async def sse_endpoint(user_id: int):
    user_id_str = str(user_id)
    live_events, live_request_queue = await start_agent_session(user_id_str)
    active_sessions[user_id_str] = live_request_queue
    print(f"Client #{user_id} connected via SSE")

    def cleanup():
        live_request_queue.close()
        active_sessions.pop(user_id_str, None)
        print(f"Client #{user_id} disconnected from SSE")

    async def event_generator():
        try:
            async for data in agent_to_client_sse(live_events):
                yield data
        except Exception as e:
            import traceback
            print(f"Error in SSE stream: {e}")
            traceback.print_exc()
        finally:
            cleanup()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
        }
    )

@app.post("/send/{user_id}")
async def send_message_endpoint(user_id: int, request: Request):
    user_id_str = str(user_id)
    live_request_queue = active_sessions.get(user_id_str)
    if not live_request_queue:
        return {"error": "Session not found"}

    message = await request.json()
    mime_type = message.get("mime_type")
    data = message.get("data")

    if mime_type == "audio/pcm":
        decoded_data = base64.b64decode(data)
        live_request_queue.send_realtime(Blob(data=decoded_data, mime_type=mime_type))
        print(f"[CLIENT TO AGENT]: audio/pcm: {len(decoded_data)} bytes")
        return {"status": "sent"}

    return {"error": f"Mime type not supported: {mime_type}"}

print("✅ main.py loaded successfully")
