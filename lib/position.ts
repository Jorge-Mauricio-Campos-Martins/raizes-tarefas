const GAP = 1000;

/**
 * Fractional-indexing helper: computes a position for a card dropped
 * between two neighbors, so reordering never requires rewriting the whole
 * column. Pass `null` for `before`/`after` when dropping at an edge.
 */
export function positionBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return GAP;
  if (before === null) return (after as number) - GAP;
  if (after === null) return before + GAP;
  return (before + after) / 2;
}
