"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const PAGE_SIZES = [10, 25, 50, 100];

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sizes = PAGE_SIZES,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (n: number) => void;
  sizes?: number[];
}) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const end = Math.min(start + pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2">
      <div className="flex items-center gap-3 text-small text-text-secondary">
        <span className="num">
          {start + 1}–{end} of <span className="text-text-primary">{total}</span>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="label-micro">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-6 rounded border border-border bg-surface px-1.5 text-small text-text-primary focus:border-primary focus:outline-none"
            >
              {sizes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          disabled={safePage === 0}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretLeft size={12} weight="bold" /> Prev
        </button>
        <span className="num px-2 text-small text-text-primary">
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          onClick={() =>
            onPageChange(Math.min(totalPages - 1, safePage + 1))
          }
          disabled={safePage >= totalPages - 1}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-small text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <CaretRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}

export function usePagination<T>(items: T[], defaultSize = 10) {
  // Helper hook wrapper (optional — consumers can also use raw useState)
  // Not a hook implementation here because the component doesn't need it.
  const pageSize = defaultSize;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return { pageSize, totalPages };
}
