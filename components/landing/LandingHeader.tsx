"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useMe } from "@/lib/hooks/useMe";

export function LandingHeader() {
  const { data: me, isLoading } = useMe();
  const isAuthed = !!me;

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center gap-1.5">
          <span className="font-display text-2xl font-normal italic leading-none tracking-tight text-text-primary">
            coven
          </span>
          <span className="relative inline-flex h-1.5 w-1.5 translate-y-1.5 rounded-full bg-primary">
            <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-75" />
          </span>
        </Link>

        {/* Brief opacity fade to avoid wrong UI flashing during auth check */}
        <div className={`flex items-center gap-2 transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}>
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-small font-semibold text-[#0b0e14] transition-colors hover:bg-primary-hover"
            >
              Open dashboard
              <ArrowRight size={12} weight="bold" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="inline-flex h-8 items-center rounded-md border border-border bg-surface/60 px-3 text-small font-medium text-text-primary backdrop-blur transition-colors hover:border-border-strong hover:bg-elevated"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-small font-semibold text-[#0b0e14] transition-colors hover:bg-primary-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
