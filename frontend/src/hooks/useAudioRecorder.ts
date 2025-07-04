import { useRef, useCallback } from 'react';

export function useAudioRecorder(onAudioChunk: (pcmData: ArrayBuffer) => void) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    if (audioContextRef.current) return;
    const audioContext = new window.AudioContext({ sampleRate: 16000 });
    await audioContext.audioWorklet.addModule('/audio/pcm-recorder-processor.js');
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    const source = audioContext.createMediaStreamSource(micStream);
    const audioNode = new AudioWorkletNode(audioContext, 'pcm-recorder-processor');
    source.connect(audioNode);
    audioNode.port.onmessage = (event) => {
      const pcmData = convertFloat32ToPCM(event.data);
      onAudioChunk(pcmData);
    };
    audioContextRef.current = audioContext;
    audioNodeRef.current = audioNode;
    micStreamRef.current = micStream;
  }, [onAudioChunk]);

  const stop = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioNodeRef.current = null;
  }, []);

  return { start, stop };
}

function convertFloat32ToPCM(inputData: Float32Array) {
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    pcm16[i] = inputData[i] * 0x7fff;
  }
  return pcm16.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
} 