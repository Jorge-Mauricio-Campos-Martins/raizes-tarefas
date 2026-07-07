"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BoardColumn } from "@/types";
import { Card } from "./Card";
import { ColumnHeader } from "./ColumnHeader";

export function Column({
  column,
  onRename,
  onArchive,
}: {
  column: BoardColumn;
  onRename: (name: string) => void;
  onArchive: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
    data: { type: "column", projectId: column.id },
  });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <ColumnHeader
        name={column.name}
        color={column.color}
        count={column.tasks.length}
        onRename={onRename}
        onArchive={onArchive}
      />
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1.5 transition ${
          isOver ? "bg-surface/60 ring-1 ring-accent/40" : ""
        }`}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </SortableContext>
        {column.tasks.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted">Nenhuma tarefa</p>
        )}
      </div>
    </div>
  );
}
