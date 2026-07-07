import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { positionBetween } from "@/lib/position";

export const runtime = "nodejs";

export async function GET() {
  const supabase = supabaseAdmin();

  const [{ data: tasks, error: tasksError }, { data: attachments, error: attachmentsError }] =
    await Promise.all([
      supabase.from("tasks").select("*").order("position", { ascending: true }),
      supabase.from("attachments").select("task_id"),
    ]);

  if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 });
  if (attachmentsError)
    return NextResponse.json({ error: attachmentsError.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const a of attachments ?? []) {
    counts.set(a.task_id, (counts.get(a.task_id) ?? 0) + 1);
  }

  const enriched = (tasks ?? []).map((t) => ({
    ...t,
    attachment_count: counts.get(t.id) ?? 0,
  }));

  return NextResponse.json({ tasks: enriched });
}

const priorityEnum = z.enum(["low", "medium", "high", "urgent"]);

const newTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: priorityEnum.default("medium"),
  project_id: z.string().uuid().nullable().optional(),
  source: z.enum(["voice", "text", "manual"]).default("manual"),
  raw_capture_text: z.string().nullable().optional(),
});

const bodySchema = z.object({
  tasks: z.array(newTaskSchema).min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const rows = [];

  // Track the running max position per project so a batch of tasks landing
  // in the same column each get appended after the previous one.
  const maxPositionByProject = new Map<string, number | null>();

  for (const task of parsed.data.tasks) {
    const projectKey = task.project_id ?? "__none__";
    if (!maxPositionByProject.has(projectKey)) {
      const query = supabase
        .from("tasks")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
      const { data } = task.project_id
        ? await query.eq("project_id", task.project_id)
        : await query.is("project_id", null);
      maxPositionByProject.set(projectKey, data?.[0]?.position ?? null);
    }

    const currentMax = maxPositionByProject.get(projectKey) ?? null;
    const position = positionBetween(currentMax, null);
    maxPositionByProject.set(projectKey, position);

    rows.push({
      title: task.title,
      description: task.description ?? null,
      due_date: task.due_date ?? null,
      priority: task.priority,
      project_id: task.project_id ?? null,
      source: task.source,
      raw_capture_text: task.raw_capture_text ?? null,
      position,
    });
  }

  const { data, error } = await supabase.from("tasks").insert(rows).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: data });
}
