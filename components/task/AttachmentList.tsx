"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { File as FileIcon, Trash2, Download } from "lucide-react";
import { api } from "@/lib/clientApi";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["attachments", taskId];
  const { data } = useQuery({
    queryKey,
    queryFn: () => api.attachments.list(taskId),
  });

  const attachments = data?.attachments ?? [];

  async function handleDownload(id: string) {
    const { url } = await api.attachments.getDownloadUrl(id);
    window.open(url, "_blank");
  }

  async function handleDelete(id: string) {
    await api.attachments.remove(id);
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  if (attachments.length === 0) {
    return <p className="text-xs text-muted">Nenhum anexo ainda.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {attachments.map((a) => (
        <li
          key={a.id}
          className="flex items-center justify-between gap-2 rounded-md border border-border bg-background-soft px-3 py-2"
        >
          <button
            onClick={() => handleDownload(a.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-foreground hover:text-accent"
          >
            <FileIcon size={14} className="shrink-0 text-muted" />
            <span className="truncate">{a.file_name}</span>
            <span className="shrink-0 text-xs text-muted">{formatSize(a.size_bytes)}</span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => handleDownload(a.id)}
              className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground"
              aria-label="Baixar"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => handleDelete(a.id)}
              className="rounded p-1 text-muted hover:bg-surface-hover hover:text-danger"
              aria-label="Remover anexo"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
