import type { Project, Task, ParsedTask } from "@/types";

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  projects: {
    list: () => jsonFetch<{ projects: Project[] }>("/api/projects"),
    create: (name: string, color?: string) =>
      jsonFetch<{ project: Project }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name, color }),
      }),
    update: (id: string, patch: Partial<Project>) =>
      jsonFetch<{ project: Project }>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    archive: (id: string) =>
      jsonFetch<{ ok: true }>(`/api/projects/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => jsonFetch<{ tasks: Task[] }>("/api/tasks"),
    get: (id: string) => jsonFetch<{ task: Task }>(`/api/tasks/${id}`),
    createMany: (tasks: Array<Partial<Task> & { title: string }>) =>
      jsonFetch<{ tasks: Task[] }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ tasks }),
      }),
    update: (id: string, patch: Partial<Task>) =>
      jsonFetch<{ task: Task }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    move: (id: string, project_id: string | null, position: number) =>
      jsonFetch<{ task: Task }>(`/api/tasks/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ project_id, position }),
      }),
    remove: (id: string) => jsonFetch<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  capture: (text: string, source: "voice" | "text") =>
    jsonFetch<{ tasks: ParsedTask[]; capture_session_id: string }>("/api/capture", {
      method: "POST",
      body: JSON.stringify({ text, source }),
    }),
  attachments: {
    list: (taskId: string) =>
      jsonFetch<{ attachments: import("@/types").Attachment[] }>(
        `/api/attachments?task_id=${taskId}`,
      ),
    getUploadUrl: (task_id: string, file: File) =>
      jsonFetch<{ storage_path: string; signed_url: string; token: string }>(
        "/api/attachments/upload-url",
        {
          method: "POST",
          body: JSON.stringify({
            task_id,
            file_name: file.name,
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
          }),
        },
      ),
    confirm: (payload: {
      task_id: string;
      storage_path: string;
      file_name: string;
      mime_type: string;
      size_bytes: number;
    }) =>
      jsonFetch<{ attachment: import("@/types").Attachment }>("/api/attachments", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      jsonFetch<{ ok: true }>(`/api/attachments/${id}`, { method: "DELETE" }),
    getDownloadUrl: (id: string) =>
      jsonFetch<{ url: string }>(`/api/attachments/${id}/download-url`),
  },
};
