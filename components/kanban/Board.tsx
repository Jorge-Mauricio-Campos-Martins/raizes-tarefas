"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useBoard } from "@/hooks/useBoard";
import { Column } from "./Column";
import { AddColumnButton } from "./AddColumnButton";
import { CardOverlay } from "./CardOverlay";
import { BoardSkeleton } from "./BoardSkeleton";
import { positionBetween } from "@/lib/position";
import type { Task } from "@/types";

export function Board() {
  const { columns, isLoading, isError, moveTask, createProject, updateProject, archiveProject } =
    useBoard();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const taskLookup = useMemo(() => {
    const map = new Map<string, { task: Task; columnId: string }>();
    for (const col of columns) {
      for (const t of col.tasks) map.set(t.id, { task: t, columnId: col.id });
    }
    return map;
  }, [columns]);

  function handleDragStart(event: DragStartEvent) {
    const found = taskLookup.get(String(event.active.id));
    setActiveTask(found?.task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeEntry = taskLookup.get(String(active.id));
    if (!activeEntry) return;

    const overId = String(over.id);
    const targetColumnId = overId.startsWith("column:")
      ? overId.replace("column:", "")
      : taskLookup.get(overId)?.columnId;

    if (!targetColumnId) return;
    const targetColumn = columns.find((c) => c.id === targetColumnId);
    if (!targetColumn) return;

    const siblingTasks = targetColumn.tasks.filter((t) => t.id !== activeEntry.task.id);

    let newIndex = siblingTasks.length;
    if (!overId.startsWith("column:")) {
      const idx = siblingTasks.findIndex((t) => t.id === overId);
      if (idx !== -1) newIndex = idx;
    }

    const before = newIndex > 0 ? siblingTasks[newIndex - 1].position : null;
    const after = newIndex < siblingTasks.length ? siblingTasks[newIndex].position : null;
    const newPosition = positionBetween(before, after);

    if (targetColumnId === activeEntry.columnId && newPosition === activeEntry.task.position) {
      return;
    }

    moveTask.mutate({ taskId: activeEntry.task.id, projectId: targetColumnId, position: newPosition });
  }

  if (isLoading) return <BoardSkeleton />;
  if (isError)
    return (
      <div className="p-6 text-sm text-danger">
        Não foi possível carregar o quadro. Verifique a configuração do Supabase (.env.local).
      </div>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto px-4 pb-4 pt-1">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onRename={(name) => updateProject.mutate({ id: column.id, patch: { name } })}
            onArchive={() => archiveProject.mutate(column.id)}
          />
        ))}
        <AddColumnButton onCreate={(name, color) => createProject.mutate({ name, color })} />
      </div>
      <DragOverlay>{activeTask ? <CardOverlay task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
