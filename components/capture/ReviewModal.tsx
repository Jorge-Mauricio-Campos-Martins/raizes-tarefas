"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import { api } from "@/lib/clientApi";
import type { ParsedTask, Priority } from "@/types";

interface EditableTask {
  title: string;
  description: string;
  due_date: string; // yyyy-mm-dd or ""
  priority: Priority;
  project_id: string | null;
}

function toEditable(task: ParsedTask, projectIdByName: Map<string, string>): EditableTask {
  return {
    title: task.title,
    description: task.description ?? "",
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    priority: task.priority,
    project_id: task.suggested_project ? projectIdByName.get(task.suggested_project) ?? null : null,
  };
}

export function ReviewModal({
  parsedTasks,
  rawText,
  source,
  onClose,
  onSaved,
}: {
  parsedTasks: ParsedTask[];
  rawText: string;
  source: "voice" | "text";
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data } = useQuery({ queryKey: ["projects"], queryFn: api.projects.list });
  const projects = data?.projects ?? [];
  const projectIdByName = new Map(projects.map((p) => [p.name, p.id]));

  const [rows, setRows] = useState<EditableTask[]>(() =>
    parsedTasks.map((t) => toEditable(t, projectIdByName)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<EditableTask>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { title: "", description: "", due_date: "", priority: "medium", project_id: null },
    ]);
  }

  async function handleSaveAll() {
    const valid = rows.filter((r) => r.title.trim().length > 0);
    if (valid.length === 0) {
      setError("Adicione ao menos um título.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.tasks.createMany(
        valid.map((r) => ({
          title: r.title.trim(),
          description: r.description.trim() || null,
          due_date: r.due_date ? new Date(r.due_date).toISOString() : null,
          priority: r.priority,
          project_id: r.project_id,
          source,
          raw_capture_text: rawText,
        })),
      );
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="glass-panel flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg text-foreground">Revisar tarefas</h2>
          <button onClick={onClose} className="text-sm text-muted hover:text-foreground">
            Fechar
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {rows.map((row, index) => (
            <div key={index} className="rounded-lg border border-border bg-background-soft p-3 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  value={row.title}
                  onChange={(e) => updateRow(index, { title: e.target.value })}
                  placeholder="Título da tarefa"
                  className="flex-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                />
                <button
                  onClick={() => removeRow(index)}
                  className="rounded p-1.5 text-muted hover:bg-surface-hover hover:text-danger"
                  aria-label="Remover tarefa"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <textarea
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                placeholder="Descrição (opcional)"
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={row.due_date}
                  onChange={(e) => updateRow(index, { due_date: e.target.value })}
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                />
                <select
                  value={row.priority}
                  onChange={(e) => updateRow(index, { priority: e.target.value as Priority })}
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
                <select
                  value={row.project_id ?? ""}
                  onChange={(e) => updateRow(index, { project_id: e.target.value || null })}
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="">Sem projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={addRow}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-xs text-muted hover:border-border-strong hover:text-foreground"
          >
            <Plus size={13} /> Adicionar tarefa
          </button>
        </div>

        {error && <p className="px-5 text-xs text-danger">{error}</p>}

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-strong disabled:opacity-50"
          >
            {saving ? "Salvando..." : `Salvar ${rows.length > 1 ? `${rows.length} tarefas` : "tarefa"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
