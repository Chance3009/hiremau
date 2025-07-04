import os
import json
import base64
import warnings

from pathlib import Path
from dotenv import load_dotenv

from google.genai.types import Blob
from google.adk.runners import InMemoryRunner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from root_agent import root_agent
from interview_summary_agent import interview_summary_agent

from fastapi import FastAPI, Request

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

# Load Gemini API Key
load_dotenv()

APP_NAME = "Hiremau"

# Track active sessions
active_sessions = {}

async def start_agent_session(user_id):
    runner = InMemoryRunner(app_name=APP_NAME, agent=root_agent)
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


async def agent_to_client_sse(live_events, user_id: str):
    in_json_block = False
    buffer = ""

    async for event in live_events:
        if event.turn_complete or event.interrupted:
            yield f"data: {json.dumps({'turn_complete': event.turn_complete, 'interrupted': event.interrupted})}\n\n"
            print(f"[AGENT TO CLIENT]: Turn complete or interrupted.")
            continue

        part = event.content.parts[0] if event.content and event.content.parts else None
        if not (part and part.text and event.partial):
            continue

        text = part.text

        if "```json" in text:
            in_json_block = True
            buffer = ""
            buffer += text.split("```json", 1)[1]
            continue

        if in_json_block:
            buffer += text
            if "```" in text:
                buffer = buffer.split("```", 1)[0].strip()
                in_json_block = False

                try:
                    parsed_json = json.loads(buffer)
                    append_transcript_to_file(parsed_json, int(user_id))

                    # ✅ Only yield status update, not the data itself
                    yield f"data: {json.dumps({'type': 'ai_message', 'payload': parsed_json})}\n\n"
                    print(f"[AGENT TO CLIENT]: JSON saved to file.")
                except Exception as e:
                    print("[⚠️ PARSE ERROR]:", e)
                    print("[RAW BUFFER]:", buffer)

                buffer = ""

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is running."}

@app.get("/events/{user_id}")
async def sse_endpoint(user_id: int):
    user_id_str = str(user_id)
    live_events, live_request_queue = await start_agent_session(user_id_str)
    active_sessions[user_id_str] = live_request_queue
    print(f"Client #{user_id} connected via SSE")

    async def event_generator():
        try:
            async for data in agent_to_client_sse(live_events, user_id_str):
                yield data
        except Exception as e:
            import traceback
            print(f"Error in SSE stream: {e}")
            traceback.print_exc()

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

    # If session not found, start one
    live_request_queue = active_sessions.get(user_id_str)
    if not live_request_queue:
        print(f"[INFO] No active session found for user {user_id_str}. Starting new session.")
        live_events, live_request_queue = await start_agent_session(user_id_str)
        active_sessions[user_id_str] = live_request_queue
        # Note: live_events is NOT consumed here — consider connecting SSE for that

    message = await request.json()
    mime_type = message.get("mime_type")
    data = message.get("data")

    if mime_type == "audio/pcm":
        try:
            decoded_data = base64.b64decode(data)
            live_request_queue.send_realtime(Blob(data=decoded_data, mime_type=mime_type))
            print(f"[CLIENT TO AGENT]: audio/pcm: {len(decoded_data)} bytes")
            return {"status": "sent"}
        except Exception as e:
            print("[ERROR] Failed to decode or send audio:", e)
            return JSONResponse(status_code=400, content={"error": "Invalid audio data"})

    return JSONResponse(status_code=400, content={"error": f"Mime type not supported: {mime_type}"})


@app.get("/transcript/{user_id}")
async def get_transcript(user_id: int):
    filename = f"responses/interview_transcript_{user_id}.json"
    if not os.path.exists(filename):
        return JSONResponse(status_code=404, content={"error": "Transcript not found"})

    with open(filename, "r") as f:
        data = json.load(f)
    return JSONResponse(content=data)

def append_transcript_to_file(transcript: dict, user_id: int):
    filename = f"responses/interview_transcript_{user_id}.json"
    if os.path.exists(filename):
        with open(filename, "r") as f:
            data = json.load(f)
    else:
        data = []
    data.append(transcript)
    os.makedirs("responses", exist_ok=True)
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    print("Saving transcript to:", filename)


@app.post("/api/notes")
async def create_note(request: Request):
    data = await request.json()
    # Save data to database here
    return {"status": "success", "note": data}


@app.post("/api/notes")
async def create_note(request: Request):
    data = await request.json()
    # Save data to database here
    return {"status": "success", "note": data}

# Define the route for the interview summary
@app.post("/summarize_interview")
async def summarize_interview(request: Request):
    try:
        interview_data = await request.json()
        response = interview_summary_agent.query(interview_data)
        return JSONResponse(content={"summary": response.text}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

print("✅ main.py loaded successfully")