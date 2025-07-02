/**
 * app.js: Cleaned-up version for audio input and text-only agent replies.
 */

const sessionId = Math.random().toString().substring(10);
const sse_url = "http://" + window.location.host + "/events/" + sessionId;
const send_url = "http://" + window.location.host + "/send/" + sessionId;
let eventSource = null;
let is_audio = true; // always audio input only

// DOM Elements
const startAudioButton = document.getElementById("startAudioButton");
const messagesDiv = document.getElementById("messages");
let currentMessageId = null;

// SSE connection
function connectSSE() {
  eventSource = new EventSource(sse_url + "?is_audio=" + is_audio);

  eventSource.onopen = () => {
    console.log("SSE connection opened.");
    messagesDiv.textContent = "Connection opened";
  };

  eventSource.onmessage = (event) => {
    const message_from_server = JSON.parse(event.data);
    console.log("[AGENT TO CLIENT]", message_from_server);

    if (message_from_server.turn_complete) {
      currentMessageId = null;
      return;
    }

    if (message_from_server.mime_type === "text/plain") {
      if (currentMessageId === null) {
        currentMessageId = Math.random().toString(36).substring(7);
        const message = document.createElement("p");
        message.id = currentMessageId;
        messagesDiv.appendChild(message);
      }

      const message = document.getElementById(currentMessageId);
      message.textContent += message_from_server.data;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  };

  eventSource.onerror = () => {
    console.log("SSE connection error or closed.");
    messagesDiv.textContent = "Connection closed";
    eventSource.close();
    setTimeout(connectSSE, 5000);
  };
}

connectSSE();

// Audio recording setup
let audioRecorderNode;
let audioRecorderContext;
let micStream;
let audioBuffer = [];
let bufferTimer = null;

import { startAudioRecorderWorklet } from "./audio-recorder.js";

function startAudio() {
  startAudioRecorderWorklet(audioRecorderHandler).then([
    (node, ctx, stream) => {
      audioRecorderNode = node;
      audioRecorderContext = ctx;
      micStream = stream;
    }
  ]);
}

startAudioButton.addEventListener("click", () => {
  startAudioButton.disabled = true;
  startAudio();
  eventSource.close();
  connectSSE();
});

function audioRecorderHandler(pcmData) {
  audioBuffer.push(new Uint8Array(pcmData));
  if (!bufferTimer) {
    bufferTimer = setInterval(sendBufferedAudio, 200);
  }
}

function sendBufferedAudio() {
  if (audioBuffer.length === 0) return;

  let totalLength = audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
  const combinedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of audioBuffer) {
    combinedBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  sendMessage({
    mime_type: "audio/pcm",
    data: arrayBufferToBase64(combinedBuffer.buffer),
  });
  console.log("[CLIENT TO AGENT] sent %s bytes", combinedBuffer.byteLength);

  audioBuffer = [];
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function sendMessage(message) {
  try {
    const response = await fetch(send_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      console.error('Failed to send message:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}