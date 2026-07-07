import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "text/plain"];
const ALLOWED_MIME_EXACT = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const bodySchema = z.object({
  task_id: z.string().uuid(),
  file_name: z.string().min(1),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { task_id, file_name, mime_type, size_bytes } = parsed.data;

  if (size_bytes > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 20MB" }, { status: 413 });
  }
  const allowed =
    ALLOWED_MIME_PREFIXES.some((p) => mime_type.startsWith(p)) ||
    ALLOWED_MIME_EXACT.includes(mime_type);
  if (!allowed) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
  }

  const supabase = supabaseAdmin();
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", task_id)
    .single();
  if (taskError || !task) {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
  }

  const storagePath = `${task_id}/${crypto.randomUUID()}-${file_name}`;
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUploadUrl(storagePath);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    storage_path: storagePath,
    signed_url: data.signedUrl,
    token: data.token,
  });
}
