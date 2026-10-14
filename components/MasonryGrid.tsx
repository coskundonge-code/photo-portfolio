'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

/**
 * Deterministic masonry layout.
 *
 * The galleries used CSS multi-column layout (`columns-1 sm:columns-2 lg:columns-3`).
 * Browsers are allowed to fragment a box across two columns inside multicol even
 * when `break-inside: avoid` is set (Safari does it for transformed/positioned boxes,
 * Chromium when a box is taller than the balanced column), which shows a photo
 * "cut in half". This component lays the items out in explicit flex columns instead,
 * so a photo can never be split.
 *
 * Items keep the same reading order as CSS columns (top-to-bottom, then next column)
 * and the columns are balanced by the estimated height of each item.
 */

export interface MasonryBreakpoint {
  /** Viewport min-width in px (Tailwind `sm` = 640, `lg` = 1024). */
  minWidth: number;
  columns: number;
}

interface MasonryGridProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  /** Estimated aspect ratio (height / width) of the item's image. */
  getAspect?: (item: T, index: number) => number | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  /** Classes for the outer flex container (gaps, background, padding...). */
  className?: string;
  /** Classes for each column. */
  columnClassName?: string;
  /** Sorted descending by minWidth. */
  breakpoints?: MasonryBreakpoint[];
  /** Columns rendered on the server before the viewport is known. */
  initialColumns?: number;
  /** Constant added to every item's weight (frame, mat and margins relative to column width). */
  itemOverhead?: number;
}

const DEFAULT_BREAKPOINTS: MasonryBreakpoint[] = [
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

const DEFAULT_ASPECT = 2 / 3; // 3:2 landscape, the most common ratio in the collection

function useColumnCount(breakpoints: MasonryBreakpoint[], initial: number): number {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const queries = breakpoints.map((bp) => ({
      bp,
      mql: window.matchMedia(`(min-width: ${bp.minWidth}px)`),
    }));
    const update = () => {
      const match = queries.find((q) => q.mql.matches);
      setCount(match ? match.bp.columns : 1);
    };
    update();
    queries.forEach((q) => q.mql.addEventListener('change', update));
    return () => queries.forEach((q) => q.mql.removeEventListener('change', update));
  }, [breakpoints]);

  return count;
}

/**
 * Splits `weights` into `k` contiguous groups minimising the tallest group
 * (classic linear partition, O(n²·k) which is trivial for a gallery).
 */
function partitionInOrder(weights: number[], k: number): number[][] {
  const n = weights.length;
  if (n === 0) return Array.from({ length: k }, () => []);
  if (k <= 1) return [weights.map((_, i) => i)];
  if (k >= n) return Array.from({ length: k }, (_, i) => (i < n ? [i] : []));

  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + weights[i];
  const sum = (a: number, b: number) => prefix[b] - prefix[a]; // weights[a..b)

  // cost[i][j] = best max-height when the first i items are split into j groups
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(Infinity));
  const split: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));
  cost[0][0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= Math.min(k, i); j++) {
      for (let x = j - 1; x < i; x++) {
        const candidate = Math.max(cost[x][j - 1], sum(x, i));
        if (candidate < cost[i][j]) {
          cost[i][j] = candidate;
          split[i][j] = x;
        }
      }
    }
  }

  const groups: number[][] = [];
  let end = n;
  for (let j = k; j >= 1; j--) {
    const start = split[end][j];
    groups.unshift(Array.from({ length: end - start }, (_, i) => start + i));
    end = start;
  }
  return groups;
}

export default function MasonryGrid<T>({
  items,
  getKey,
  getAspect,
  renderItem,
  className = '',
  columnClassName = '',
  breakpoints = DEFAULT_BREAKPOINTS,
  initialColumns = 3,
  itemOverhead = 0.35,
}: MasonryGridProps<T>) {
  const columnCount = useColumnCount(breakpoints, initialColumns);

  const columns = useMemo(() => {
    const weights = items.map((item, index) => {
      const aspect = getAspect?.(item, index);
      const safeAspect = aspect && Number.isFinite(aspect) && aspect > 0 ? aspect : DEFAULT_ASPECT;
      return safeAspect + itemOverhead;
    });
    return partitionInOrder(weights, columnCount);
  }, [items, getAspect, columnCount, itemOverhead]);

  return (
    <div className={`flex items-start ${className}`}>
      {columns.map((indices, columnIndex) => (
        <div key={columnIndex} className={`min-w-0 flex-1 ${columnClassName}`}>
          {indices.map((index) => (
            <div key={getKey(items[index], index)}>{renderItem(items[index], index)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
