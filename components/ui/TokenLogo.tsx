"use client";

import { useMemo, useState } from "react";
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

// DEXScreener's chain keys differ slightly from ours
const DS_CHAIN: Record<string, string> = {
  solana: "solana",
  bsc: "bsc",
  eth: "ethereum",
  base: "base",
  arbitrum: "arbitrum",
  polygon: "polygon",
};

function parseContractAndChain(
  tokenId?: string | null,
  chain?: string | null,
): { contract: string; chainName: string } | null {
  if (!tokenId) return null;
  let contract = tokenId;
  let chainName = chain ?? "";
  if (tokenId.includes("-")) {
    const idx = tokenId.lastIndexOf("-");
    contract = tokenId.slice(0, idx);
    chainName = tokenId.slice(idx + 1);
  }
  if (!contract || !chainName) return null;
  return { contract, chainName: chainName.toLowerCase() };
}

/** Build the list of CDN URLs to try in order. */
function buildCandidateUrls(
  tokenId?: string | null,
  chain?: string | null,
): string[] {
  const parsed = parseContractAndChain(tokenId, chain);
  if (!parsed) return [];
  const { contract, chainName } = parsed;
  const lc = contract.toLowerCase();
  const dsChain = DS_CHAIN[chainName];
  const urls: string[] = [];

  // 1. AVE — works for many mainstream tokens
  urls.push(`https://www.iconaves.com/token_icon/${chainName}/${lc}.png`);

  // 2. DEXScreener — broad coverage, esp. Solana/BSC memes
  if (dsChain) {
    urls.push(
      `https://dd.dexscreener.com/ds-data/tokens/${dsChain}/${lc}.png?size=lg`,
    );
  }

  // 3. CoinGecko (unlikely for memes but useful for majors)
  //    Skipped — their CDN path requires an internal id we don't have.

  return urls;
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
  const candidates = useMemo(
    () => [
      ...(logoUrl ? [logoUrl] : []),
      ...buildCandidateUrls(tokenId, chain),
    ],
    [logoUrl, tokenId, chain],
  );

  const [idx, setIdx] = useState(0);
  const letter = (symbol?.replace("$", "").charAt(0) ?? "?").toUpperCase();
  const chainKey = (chain ?? "").toLowerCase();
  const bg = CHAIN_BG[chainKey] ?? "bg-elevated text-text-secondary";
  const dotBg = CHAIN_DOT[chainKey] ?? "bg-text-muted";

  const src = candidates[idx];
  const exhausted = idx >= candidates.length;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {!exhausted && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={symbol ?? ""}
          className="h-full w-full rounded-full border border-border bg-elevated object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setIdx((n) => n + 1)}
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
