"use client";

import { useSignalStream } from "@/lib/hooks/useSignalStream";

/**
 * Opens the SSE connection once for the whole app.
 * Mount it high in the tree. Stream updates flow into TanStack Query cache.
 */
export function StreamProvider() {
  useSignalStream();
  return null;
}
