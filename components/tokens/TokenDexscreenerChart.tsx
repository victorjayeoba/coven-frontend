"use client";

/**
 * DexScreener chart embed.
 *
 * For Solana / BSC meme tokens this gives us exactly what users expect:
 * the same chart + live trades panel they see on dexscreener.com, with
 * sub-second updates direct from DexScreener's own indexer. We lose the
 * ability to overlay our bot's entry/exit markers, but we gain parity
 * with the source of truth every memecoin trader uses.
 *
 * URL format accepts either a pair address or a token mint — when given
 * a mint, DexScreener auto-redirects to the top-liquidity pair.
 */

type Props = {
  tokenId: string | null | undefined;
  height?: number;
};

const CHAIN_MAP: Record<string, string> = {
  solana: "solana",
  bsc: "bsc",
  eth: "ethereum",
  ethereum: "ethereum",
  base: "base",
  arbitrum: "arbitrum",
  polygon: "polygon",
};

export function TokenDexscreenerChart({ tokenId, height = 520 }: Props) {
  if (!tokenId) return null;

  const [address, chainRaw] = tokenId.includes("-")
    ? [
        tokenId.slice(0, tokenId.lastIndexOf("-")),
        tokenId.split("-").pop() ?? "",
      ]
    : [tokenId, ""];

  const chain = CHAIN_MAP[chainRaw.toLowerCase()] ?? chainRaw.toLowerCase();
  if (!chain || !address) return null;

  const url = `https://dexscreener.com/${chain}/${address}?embed=1&theme=dark&trades=1&info=0`;

  return (
    <div
      className="overflow-hidden rounded-md border border-border bg-base"
      style={{ height }}
    >
      <iframe
        src={url}
        title="DexScreener price chart"
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="clipboard-write"
        loading="lazy"
      />
    </div>
  );
}
