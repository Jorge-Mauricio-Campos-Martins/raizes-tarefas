import type { Priority } from "@/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_CLASS: Record<Priority, string> = {
  low: "bg-surface-hover text-muted",
  medium: "bg-accent/15 text-accent",
  high: "bg-warning/20 text-warning",
  urgent: "bg-danger/20 text-danger",
};

export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.round(
    (date.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86_400_000,
  );

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  if (diffDays === -1) return "Ontem";
  if (diffDays < -1) return `Atrasada · ${date.toLocaleDateString("pt-BR")}`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
}
