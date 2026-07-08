"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2 } from "lucide-react";
import { api } from "@/lib/clientApi";
import type { ParsedTask } from "@/types";
import { VoiceRecorder } from "./VoiceRecorder";
import { TextFallback } from "./TextFallback";
import { ReviewModal } from "./ReviewModal";

type Stage =
  | { name: "closed" }
  | { name: "capturing" }
  | { name: "processing"; label: string }
  | { name: "reviewing"; tasks: ParsedTask[]; rawText: string; source: "voice" | "text" }
  | { name: "error"; message: string };

export function QuickCapture() {
  const [stage, setStage] = useState<Stage>({ name: "closed" });
  const queryClient = useQueryClient();

  function fallbackTask(text: string): ParsedTask {
    return {
      title: text.slice(0, 120),
      description: text.length > 120 ? text : null,
      due_date: null,
      priority: "medium",
      suggested_project: null,
    };
  }

  async function handleText(text: string) {
    setStage({ name: "processing", label: "Organizando suas tarefas..." });
    try {
      const result = await api.capture(text, "text");
      const tasks = result.tasks.length > 0 ? result.tasks : [fallbackTask(text)];
      setStage({ name: "reviewing", tasks, rawText: text, source: "text" });
    } catch (err) {
      setStage({
        name: "error",
        message: err instanceof Error ? err.message : "Não foi possível organizar as tarefas.",
      });
    }
  }

  async function handleAudio(blob: Blob) {
    setStage({ name: "processing", label: "Transcrevendo e organizando suas tarefas..." });
    try {
      const result = await api.captureAudio(blob);
      const tasks = result.tasks.length > 0 ? result.tasks : [fallbackTask(result.transcript)];
      setStage({
        name: "reviewing",
        tasks,
        rawText: result.transcript,
        source: "voice",
      });
    } catch (err) {
      setStage({
        name: "error",
        message: err instanceof Error ? err.message : "Não foi possível transcrever o áudio.",
      });
    }
  }

  if (stage.name === "reviewing") {
    return (
      <ReviewModal
        parsedTasks={stage.tasks}
        rawText={stage.rawText}
        source={stage.source}
        onClose={() => setStage({ name: "closed" })}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          setStage({ name: "closed" });
        }}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setStage({ name: "capturing" })}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:bg-accent-strong active:scale-95"
        aria-label="Capturar nova tarefa"
      >
        <Plus size={26} />
      </button>

      {stage.name !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="glass-panel w-full max-w-md rounded-t-2xl p-5 sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Nova captura</h2>
              <button
                onClick={() => setStage({ name: "closed" })}
                className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {stage.name === "processing" && (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 size={28} className="animate-spin text-accent" />
                <p className="text-sm text-muted">{stage.label}</p>
              </div>
            )}

            {stage.name === "error" && (
              <div className="space-y-3 py-4">
                <p className="text-sm text-danger">{stage.message}</p>
                <button
                  onClick={() => setStage({ name: "capturing" })}
                  className="w-full rounded-md bg-surface-hover px-4 py-2 text-sm text-foreground hover:bg-border-strong"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {stage.name === "capturing" && (
              <div className="space-y-4">
                <VoiceRecorder onRecorded={handleAudio} />
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="h-px flex-1 bg-border" />
                  ou
                  <div className="h-px flex-1 bg-border" />
                </div>
                <TextFallback onSubmit={handleText} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
