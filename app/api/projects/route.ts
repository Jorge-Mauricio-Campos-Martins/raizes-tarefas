import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { positionBetween } from "@/lib/position";

export const runtime = "nodejs";

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_archived", false)
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

const bodySchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data: last } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  const position = positionBetween(last?.[0]?.position ?? null, null);

  const { data, error } = await supabase
    .from("projects")
    .insert({ name: parsed.data.name, color: parsed.data.color ?? "#8fe08a", position })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}
