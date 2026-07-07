"use client";

import { useRef, useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { api } from "@/lib/clientApi";

export function AttachmentUploader({
  taskId,
  onUploaded,
}: {
  taskId: string;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { signed_url, storage_path } = await api.attachments.getUploadUrl(taskId, file);

      const putRes = await fetch(signed_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error("Falha no upload do arquivo");

      await api.attachments.confirm({
        task_id: taskId,
        storage_path,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      });

      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao anexar arquivo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,text/plain"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:border-border-strong hover:text-foreground disabled:opacity-50"
      >
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
        {uploading ? "Enviando..." : "Anexar arquivo"}
      </button>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
