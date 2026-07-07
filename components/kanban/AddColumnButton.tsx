"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const PALETTE = ["#8fe08a", "#c7a9e0", "#e0c98a", "#e08a8a", "#8ab4e0", "#6fce6a", "#a3d1ad"];

export function AddColumnButton({ onCreate }: { onCreate: (name: string, color: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
      >
        <Plus size={15} /> Novo projeto
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed) {
          onCreate(trimmed, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        }
        setName("");
        setOpen(false);
      }}
      className="glass-panel flex h-fit w-72 shrink-0 flex-col gap-2 rounded-lg p-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !name.trim() && setOpen(false)}
        placeholder="Nome do projeto"
        className="w-full rounded-md border border-border bg-background-soft px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent-strong"
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
