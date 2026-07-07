import "server-only";
import { Type } from "@google/genai";
import { geminiClient } from "./client";
import { extractTasksResultSchema, type ExtractTasksResult } from "./schema";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Título curto e no imperativo, ex: 'Enviar contrato para Edu'.",
          },
          description: {
            type: Type.STRING,
            nullable: true,
            description: "Contexto adicional extraído da fala, ou null se não houver.",
          },
          due_date: {
            type: Type.STRING,
            nullable: true,
            description:
              "Data/hora em ISO 8601 (ex: 2026-07-10 ou 2026-07-10T15:00:00), resolvida a partir de linguagem relativa como 'amanhã' ou 'sexta que vem'. null se não houver prazo mencionado.",
          },
          priority: {
            type: Type.STRING,
            enum: ["low", "medium", "high", "urgent"],
            description: "Prioridade inferida do tom/urgência da fala. Default 'medium' se não houver pista.",
          },
          suggested_project: {
            type: Type.STRING,
            nullable: true,
            description:
              "Deve ser exatamente um dos nomes de projeto fornecidos na lista, ou null se não for claro a qual projeto pertence.",
          },
        },
        required: ["title", "description", "due_date", "priority", "suggested_project"],
      },
    },
  },
  required: ["tasks"],
};

function buildSystemPrompt(projectNames: string[], today: string) {
  return `Você é um assistente que transforma áudio/texto ditado por Jorge em tarefas estruturadas.

Contexto de Jorge: ele lida com múltiplos projetos/áreas ao mesmo tempo (trabalho para "Edu Farah", atendimentos de "Jornada do Propósito", projetos pessoais, canais de YouTube, entre outros) e dita tarefas rapidamente enquanto está em movimento, muitas vezes de forma corrida ou informal.

Data de hoje: ${today}. Resolva expressões relativas de data/hora ("amanhã", "sexta que vem", "daqui a duas semanas") para uma data ISO 8601 concreta com base nessa data.

Projetos existentes (use o nome exatamente como aparece, ou null se não estiver claro):
${projectNames.map((p) => `- ${p}`).join("\n")}

Regras:
- Se a fala contiver mais de um pedido/tarefa distinta, separe em várias tarefas.
- Título deve ser curto e acionável.
- Descrição deve conter detalhes/contexto extras, ou null se não houver nada além do título.
- Nunca invente um projeto que não está na lista acima.
- Responda apenas com o JSON pedido, sem texto adicional.`;
}

export async function extractTasks(
  text: string,
  projectNames: string[],
): Promise<ExtractTasksResult> {
  const client = geminiClient();
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: text,
    config: {
      systemInstruction: buildSystemPrompt(projectNames, today),
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini did not return a text response");
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("Gemini response was not valid JSON");
  }

  const parsed = extractTasksResultSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid extract_tasks payload: ${parsed.error.message}`);
  }

  // Hallucination-proofing: null out any suggested_project that doesn't
  // match a real project name instead of trusting the model blindly.
  const validNames = new Set(projectNames);
  const sanitized: ExtractTasksResult = {
    tasks: parsed.data.tasks.map((task) => ({
      ...task,
      suggested_project:
        task.suggested_project && validNames.has(task.suggested_project)
          ? task.suggested_project
          : null,
    })),
  };

  return sanitized;
}
