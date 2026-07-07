"use client";

import { Mic, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export function VoiceRecorder({
  onTranscriptReady,
}: {
  onTranscriptReady: (text: string) => void;
}) {
  const { isSupported, isListening, transcript, start, stop, reset } = useSpeechRecognition();

  if (!isSupported) {
    return (
      <p className="rounded-md bg-surface-hover px-3 py-2 text-xs text-muted">
        Reconhecimento de voz não disponível neste navegador — use o Chrome no Android, ou
        digite abaixo.
      </p>
    );
  }

  function handleToggle() {
    if (isListening) {
      stop();
    } else {
      reset();
      start();
    }
  }

  function handleUseTranscript() {
    if (transcript.trim()) onTranscriptReady(transcript.trim());
    stop();
    reset();
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
          isListening ? "mic-pulse bg-danger text-background" : "bg-accent text-accent-foreground"
        }`}
        aria-label={isListening ? "Parar gravação" : "Começar a falar"}
      >
        {isListening ? <Square size={22} /> : <Mic size={24} />}
      </button>
      <p className="text-xs text-muted">
        {isListening ? "Ouvindo... toque para parar" : "Toque e fale sua tarefa"}
      </p>
      {transcript && (
        <div className="w-full space-y-2">
          <p className="max-h-24 overflow-y-auto rounded-md bg-background-soft p-2.5 text-sm text-foreground">
            {transcript}
          </p>
          <button
            type="button"
            onClick={handleUseTranscript}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-strong"
          >
            Organizar tarefas
          </button>
        </div>
      )}
    </div>
  );
}
