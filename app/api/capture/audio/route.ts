import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { runCapture } from "@/lib/ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const audio = form.get("audio");

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Nenhum áudio recebido" }, { status: 400 });
  }

  let transcript: string;
  try {
    transcript = await transcribeAudio(audio);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao transcrever o áudio" },
      { status: 502 },
    );
  }

  try {
    const result = await runCapture(transcript, "voice");
    return NextResponse.json({ ...result, transcript });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI extraction failed" },
      { status },
    );
  }
}
