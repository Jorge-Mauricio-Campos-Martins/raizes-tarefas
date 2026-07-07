import type { Task } from "@/types";
import { PRIORITY_CLASS, PRIORITY_LABEL } from "./priority";

export function CardOverlay({ task }: { task: Task }) {
  return (
    <div className="w-72 rounded-lg border border-border-strong bg-surface-hover p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      <div className="mt-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CLASS[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
    </div>
  );
}
