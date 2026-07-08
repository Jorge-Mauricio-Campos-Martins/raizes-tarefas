"use client";

import { Mic, Square } from "lucide-react";
import { useAudioRecorder, MAX_RECORDING_SECONDS } from "@/hooks/useAudioRecorder";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({ onRecorded }: { onRecorded: (blob: Blob) => void }) {
  const { isSupported, isRecording, elapsedSeconds, error, start, stop } = useAudioRecorder();

  if (!isSupported) {
    return (
      <p className="rounded-md bg-surface-hover px-3 py-2 text-xs text-muted">
        Gravação de voz não disponível neste navegador — use o campo de texto abaixo.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => (isRecording ? stop() : start(onRecorded))}
        className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
          isRecording ? "mic-pulse bg-danger text-background" : "bg-accent text-accent-foreground"
        }`}
        aria-label={isRecording ? "Parar gravação" : "Começar a falar"}
      >
        {isRecording ? <Square size={22} /> : <Mic size={24} />}
      </button>
      <p className="text-xs text-muted">
        {isRecording
          ? `Gravando... ${formatTime(elapsedSeconds)} / ${formatTime(MAX_RECORDING_SECONDS)}`
          : `Toque e fale sua tarefa (máx. ${formatTime(MAX_RECORDING_SECONDS)})`}
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
