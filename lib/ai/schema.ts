import { z } from "zod";

export const priorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const parsedTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  priority: priorityEnum,
  suggested_project: z.string().nullable(),
});

export const extractTasksResultSchema = z.object({
  tasks: z.array(parsedTaskSchema).min(1),
});

export type ParsedTask = z.infer<typeof parsedTaskSchema>;
export type ExtractTasksResult = z.infer<typeof extractTasksResultSchema>;
