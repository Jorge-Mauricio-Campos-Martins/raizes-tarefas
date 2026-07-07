import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { extractTasks } from "@/lib/ai/extractTasks";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  text: z.string().min(1),
  source: z.enum(["voice", "text"]),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { text, source } = parsed.data;

  const supabase = supabaseAdmin();
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("name")
    .eq("is_archived", false);

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projectNames = (projects ?? []).map((p) => p.name);

  let result;
  try {
    result = await extractTasks(text, projectNames);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI extraction failed" },
      { status: 502 },
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("capture_sessions")
    .insert({ input_type: source, raw_text: text, claude_response: result })
    .select("id")
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: result.tasks, capture_session_id: session.id });
}
