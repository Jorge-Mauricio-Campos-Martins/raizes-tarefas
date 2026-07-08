import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { extractTasks } from "./extractTasks";
import type { CaptureSource } from "@/types";

export async function runCapture(text: string, source: CaptureSource & ("voice" | "text")) {
  const supabase = supabaseAdmin();
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("name")
    .eq("is_archived", false);

  if (projectsError) {
    throw Object.assign(new Error(projectsError.message), { status: 500 });
  }

  const projectNames = (projects ?? []).map((p) => p.name);
  const result = await extractTasks(text, projectNames);

  const { data: session, error: sessionError } = await supabase
    .from("capture_sessions")
    .insert({ input_type: source, raw_text: text, claude_response: result })
    .select("id")
    .single();

  if (sessionError) {
    throw Object.assign(new Error(sessionError.message), { status: 500 });
  }

  return { tasks: result.tasks, capture_session_id: session.id as string };
}
