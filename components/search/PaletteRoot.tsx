"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/stores/useUIStore";
import { CommandPalette } from "./CommandPalette";

/**
 * Single instance of the command palette, mounted at the app root.
 * Also wires the global Cmd/Ctrl+K keybinding.
 */
export function PaletteRoot() {
  const { paletteOpen, openPalette, closePalette, togglePalette } =
    useUIStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK =
        (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isCmdK) {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePalette]);

  return <CommandPalette open={paletteOpen} onClose={closePalette} />;
}
