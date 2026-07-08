"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_RECORDING_SECONDS = 180;

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  if (typeof MediaRecorder === "undefined") return "";
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return "";
}

export function useAudioRecorder() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStopRef = useRef<((blob: Blob) => void) | null>(null);

  useEffect(() => {
    // Deferred to an effect: `navigator`/`MediaRecorder` are undefined during
    // SSR, so this must run post-hydration to avoid a markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    timerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(
    async (onStop: (blob: Blob) => void) => {
      setError(null);
      onStopRef.current = onStop;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
          cleanup();
          setIsRecording(false);
          setElapsedSeconds(0);
          onStopRef.current?.(blob);
        };

        recorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        setElapsedSeconds(0);

        timerRef.current = setInterval(() => {
          setElapsedSeconds((seconds) => {
            const next = seconds + 1;
            if (next >= MAX_RECORDING_SECONDS) {
              recorder.stop();
            }
            return next;
          });
        }, 1000);
      } catch {
        setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
      }
    },
    [cleanup],
  );

  return { isSupported, isRecording, elapsedSeconds, error, start, stop };
}
