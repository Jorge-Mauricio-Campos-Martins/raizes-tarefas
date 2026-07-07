"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function TextFallback({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        rows={3}
        placeholder="Ou digite aqui... ex: enviar contrato pro Edu até sexta, prioridade alta"
        className="w-full resize-none rounded-md border border-border bg-background-soft px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="flex items-center justify-center gap-2 self-end rounded-md bg-surface-hover px-4 py-2 text-sm font-medium text-foreground transition hover:bg-border-strong disabled:opacity-40"
      >
        <Send size={14} /> Organizar tarefas
      </button>
    </div>
  );
}
