# realtime_transcribe.py
from dotenv import load_dotenv
load_dotenv()

import sounddevice as sd
import queue
from google.cloud import speech

SAMPLE_RATE = 16000
BLOCK_SIZE = 1024
audio_queue = queue.Queue()

# Sample input for the tool
resume_summary = "Experienced in React and Firebase. Final year project: React dashboard for UPM students."
expected_script = "I built a React dashboard for my final year project."

def audio_callback(indata, frames, time_info, status):
    if status:
        print("⚠️ Mic Error:", status)
    audio_queue.put(bytes(indata))

def audio_generator():
    while True:
        chunk = audio_queue.get()
        if chunk is None:
            break
        yield chunk

async def run_realtime_interview(interview_agent):
    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=SAMPLE_RATE,
        language_code="en-US",
    )

    streaming_config = speech.StreamingRecognitionConfig(
        config=config,
        interim_results=True,
    )

    print("🎤 Speak into your mic...")

    with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=BLOCK_SIZE, dtype='int16',
                           channels=1, callback=audio_callback):
        audio_gen = audio_generator()
        requests = (speech.StreamingRecognizeRequest(audio_content=chunk) for chunk in audio_gen)

        responses = client.streaming_recognize(streaming_config, requests)

        try:
            for response in responses:
                if not response.results:
                    continue

                result = response.results[0]
                if not result.alternatives:
                    continue

                transcript = result.alternatives[0].transcript

                if result.is_final:
                    print(f"\n🗣️ Transcript: {transcript}")

                    agent_response = await interview_agent.invoke(
                        task="verify_transcript",
                        input={
                            "spoken_text": transcript,
                            "resume_summary": resume_summary,
                            "expected_script": expected_script,
                        }
                    )

                    print("🤖 Agent Output:")
                    print(f"Score: {agent_response.get('match_score')}")
                    print(f"Discrepancy: {agent_response.get('discrepancy')}")
                    print(f"Follow-up: {agent_response.get('follow_up_question')}\n")

        except Exception as e:
            print("❌ Error during transcription:", e)
