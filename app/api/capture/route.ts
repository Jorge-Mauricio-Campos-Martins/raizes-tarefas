import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runCapture } from "@/lib/ai/pipeline";

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

  try {
    const result = await runCapture(parsed.data.text, parsed.data.source);
    return NextResponse.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI extraction failed" },
      { status },
    );
  }
}
