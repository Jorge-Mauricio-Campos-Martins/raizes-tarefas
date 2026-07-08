import "server-only";

export async function transcribeAudio(file: File): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY env var");
  }

  const form = new FormData();
  form.append("file", file, file.name || "capture.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "pt");
  form.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq transcription failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { text?: string };
  if (!data.text) {
    throw new Error("Groq transcription returned no text");
  }

  return data.text.trim();
}
