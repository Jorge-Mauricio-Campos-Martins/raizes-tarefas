"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Archive } from "lucide-react";

export function ColumnHeader({
  name,
  color,
  count,
  onRename,
  onArchive,
}: {
  name: string;
  color: string;
  count: number;
  onRename: (name: string) => void;
  onArchive: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [menuOpen, setMenuOpen] = useState(false);

  function submitRename() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onRename(trimmed);
    else setValue(name);
  }

  return (
    <div className="flex items-center justify-between px-1 pb-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === "Enter" && submitRename()}
            className="w-full rounded bg-background-soft px-1.5 py-0.5 text-sm font-medium text-foreground outline-none"
          />
        ) : (
          <h2 className="truncate text-sm font-medium text-foreground">{name}</h2>
        )}
        <span className="shrink-0 text-xs text-muted">{count}</span>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label="Opções da coluna"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="glass-panel absolute right-0 z-10 mt-1 w-36 rounded-md p-1 text-sm shadow-lg">
            <button
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-surface-hover"
            >
              <Pencil size={13} /> Renomear
            </button>
            <button
              onClick={() => {
                onArchive();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-danger hover:bg-surface-hover"
            >
              <Archive size={13} /> Arquivar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
