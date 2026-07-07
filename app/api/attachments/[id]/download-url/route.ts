import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseAdmin();

  const { data: attachment, error: fetchError } = await supabase
    .from("attachments")
    .select("storage_path, file_name")
    .eq("id", id)
    .single();

  if (fetchError || !attachment) {
    return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(attachment.storage_path, 60, {
      download: attachment.file_name,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
