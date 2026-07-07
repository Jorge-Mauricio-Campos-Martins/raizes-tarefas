"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { api } from "@/lib/clientApi";
import type { Priority, TaskStatus } from "@/types";
import { AttachmentUploader } from "./AttachmentUploader";
import { AttachmentList } from "./AttachmentList";

export function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskKey = ["task", taskId];

  const { data, isLoading } = useQuery({ queryKey: taskKey, queryFn: () => api.tasks.get(taskId) });
  const { data: projectsData } = useQuery({ queryKey: ["projects"], queryFn: api.projects.list });
  const [deleting, setDeleting] = useState(false);

  const task = data?.task;
  const projects = projectsData?.projects ?? [];

  async function patch(fields: Record<string, unknown>) {
    await api.tasks.update(taskId, fields);
    queryClient.invalidateQueries({ queryKey: taskKey });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function handleDelete() {
    setDeleting(true);
    await api.tasks.remove(taskId);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    router.push("/");
  }

  if (isLoading || !task) {
    return <div className="p-6 text-sm text-muted">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        onClick={() => router.push("/")}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} /> Voltar ao quadro
      </button>

      <div className="glass-panel space-y-5 rounded-xl p-5">
        <input
          defaultValue={task.title}
          onBlur={(e) => e.target.value.trim() && patch({ title: e.target.value.trim() })}
          className="w-full bg-transparent font-display text-xl text-foreground outline-none"
        />

        <textarea
          defaultValue={task.description ?? ""}
          onBlur={(e) => patch({ description: e.target.value || null })}
          placeholder="Descrição..."
          rows={4}
          className="w-full resize-none rounded-md border border-border bg-background-soft px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Prazo</label>
            <input
              type="date"
              defaultValue={task.due_date ? task.due_date.slice(0, 10) : ""}
              onChange={(e) =>
                patch({ due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
              }
              className="w-full rounded-md border border-border bg-background-soft px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Prioridade</label>
            <select
              defaultValue={task.priority}
              onChange={(e) => patch({ priority: e.target.value as Priority })}
              className="w-full rounded-md border border-border bg-background-soft px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Status</label>
            <select
              defaultValue={task.status}
              onChange={(e) => patch({ status: e.target.value as TaskStatus })}
              className="w-full rounded-md border border-border bg-background-soft px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="todo">A fazer</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluída</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Projeto</label>
            <select
              defaultValue={task.project_id ?? ""}
              onChange={(e) => patch({ project_id: e.target.value || null })}
              className="w-full rounded-md border border-border bg-background-soft px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
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

        {task.raw_capture_text && (
          <div className="rounded-md bg-background-soft p-3">
            <p className="mb-1 text-xs text-muted">Captura original ({task.source === "voice" ? "voz" : "texto"})</p>
            <p className="text-xs text-foreground/80">{task.raw_capture_text}</p>
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Anexos</p>
            <AttachmentUploader
              taskId={taskId}
              onUploaded={() => {
                queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
              }}
            />
          </div>
          <AttachmentList taskId={taskId} />
        </div>

        <div className="border-t border-border pt-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs text-danger hover:underline disabled:opacity-50"
          >
            <Trash2 size={13} /> Excluir tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
