"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const CHAIN_BG: Record<string, string> = {
  solana: "bg-chain-solana/20 text-chain-solana",
  bsc: "bg-chain-bsc/20 text-chain-bsc",
  eth: "bg-chain-eth/20 text-chain-eth",
  base: "bg-chain-base/20 text-chain-base",
  arbitrum: "bg-chain-arbitrum/20 text-chain-arbitrum",
  polygon: "bg-chain-polygon/20 text-chain-polygon",
};

const CHAIN_DOT: Record<string, string> = {
  solana: "bg-chain-solana",
  bsc: "bg-chain-bsc",
  eth: "bg-chain-eth",
  base: "bg-chain-base",
  arbitrum: "bg-chain-arbitrum",
  polygon: "bg-chain-polygon",
};

/**
 * Build AVE's icon CDN URL from a token_id or contract+chain pair.
 * token_id shape: "{contract}-{chain}" (what our backend stores).
 */
function aveIconUrl(
  tokenId?: string | null,
  chain?: string | null,
): string | null {
  if (!tokenId) return null;
  let contract = tokenId;
  let chainName = chain ?? "";
  if (tokenId.includes("-")) {
    const idx = tokenId.lastIndexOf("-");
    contract = tokenId.slice(0, idx);
    chainName = tokenId.slice(idx + 1);
  }
  if (!contract || !chainName) return null;
  return `https://www.iconaves.com/token_icon/${chainName.toLowerCase()}/${contract.toLowerCase()}.png`;
}

export function TokenLogo({
  symbol,
  chain,
  tokenId,
  size = 28,
  logoUrl,
}: {
  symbol?: string | null;
  chain?: string | null;
  tokenId?: string | null;
  size?: number;
  logoUrl?: string | null;
}) {
  const [errored, setErrored] = useState(false);
  const letter = (symbol?.replace("$", "").charAt(0) ?? "?").toUpperCase();
  const chainKey = (chain ?? "").toLowerCase();
  const bg = CHAIN_BG[chainKey] ?? "bg-elevated text-text-secondary";
  const dotBg = CHAIN_DOT[chainKey] ?? "bg-text-muted";

  const src = logoUrl ?? aveIconUrl(tokenId, chain);
  const showImg = src && !errored;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={symbol ?? ""}
          className="h-full w-full rounded-full border border-border bg-elevated object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
        />
      ) : (
        <div
          className={cn(
            "grid h-full w-full place-items-center rounded-full border border-border font-semibold",
            bg,
          )}
          style={{ fontSize: size * 0.42 }}
        >
          {letter}
        </div>
      )}
      {chainKey ? (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 inline-block rounded-full border-2 border-surface",
            dotBg,
          )}
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      ) : null}
    </div>
  );
}
