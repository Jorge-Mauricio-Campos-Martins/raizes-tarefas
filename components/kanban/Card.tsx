"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Paperclip } from "lucide-react";
import type { Task } from "@/types";
import { PRIORITY_CLASS, PRIORITY_LABEL, formatDueDate, isOverdue } from "./priority";

export function Card({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dueLabel = formatDueDate(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-border-strong hover:bg-surface-hover"
    >
      <Link href={`/task/${task.id}`} className="block" onClick={(e) => isDragging && e.preventDefault()}>
        <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{task.description}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CLASS[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {dueLabel && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isOverdue(task.due_date) ? "bg-danger/20 text-danger" : "bg-surface-hover text-muted"
              }`}
            >
              {dueLabel}
            </span>
          )}
          {!!task.attachment_count && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted">
              <Paperclip size={11} />
              {task.attachment_count}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
