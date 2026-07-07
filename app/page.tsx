import { Board } from "@/components/kanban/Board";
import { QuickCapture } from "@/components/capture/QuickCapture";

export default function HomePage() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Raízes</p>
          <h1 className="font-display text-lg text-foreground">Suas tarefas</h1>
        </div>
        <form action="/api/logout" method="POST">
          <button type="submit" className="text-xs text-muted hover:text-foreground">
            Sair
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-hidden">
        <Board />
      </div>

      <QuickCapture />
    </main>
  );
}
