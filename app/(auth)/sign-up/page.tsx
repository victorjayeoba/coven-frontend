"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { signUp } from "@/lib/api/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => signUp(email, password),
    onSuccess: () => router.push("/dashboard"),
  });

  return (
    <div className="relative rounded-xl border border-border bg-surface/60 p-6 shadow-[0_0_0_1px_rgba(60,196,123,0.05)] backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(60,196,123,0.06) 0%, transparent 40%)",
        }}
      />

      <div className="relative space-y-5">
        <div>
          <h1 className="text-h1 font-semibold text-text-primary">Join the circle</h1>
          <p className="mt-1 text-small text-text-secondary">
            start watching smart money in 30 seconds.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <label className="label-micro">Email</label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="label-micro">Password</label>
            <PasswordInput
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-micro text-text-muted">min 8 characters.</p>
          </div>
          {mutation.isError && (
            <p className="text-small text-loss">
              Could not create account (email may already exist)
            </p>
          )}
          <Button
            type="submit"
            className="group w-full justify-between"
            disabled={mutation.isPending}
          >
            <span>{mutation.isPending ? "Creating…" : "Create account"}</span>
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
            />
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-small text-text-secondary">
          Already in?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
