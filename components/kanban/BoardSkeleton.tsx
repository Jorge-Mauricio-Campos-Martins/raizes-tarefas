export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-x-hidden px-4 pb-4 pt-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex w-72 shrink-0 flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-16 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ))}
    </div>
  );
}
