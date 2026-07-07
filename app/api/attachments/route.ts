import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const bodySchema = z.object({
  task_id: z.string().uuid(),
  storage_path: z.string().min(1),
  file_name: z.string().min(1),
  mime_type: z.string().nullable().optional(),
  size_bytes: z.number().int().nonnegative().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("attachments")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attachment: data });
}

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("task_id");
  if (!taskId) return NextResponse.json({ error: "task_id é obrigatório" }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attachments: data });
}
