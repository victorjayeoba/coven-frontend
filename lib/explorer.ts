export type ChainKey =
  | "solana"
  | "bsc"
  | "eth"
  | "base"
  | "arbitrum"
  | "polygon";

const EXPLORERS: Record<string, { name: string; address: string; tx: string }> =
  {
    solana: {
      name: "Solscan",
      address: "https://solscan.io/account/",
      tx: "https://solscan.io/tx/",
    },
    bsc: {
      name: "BSCScan",
      address: "https://bscscan.com/address/",
      tx: "https://bscscan.com/tx/",
    },
    eth: {
      name: "Etherscan",
      address: "https://etherscan.io/address/",
      tx: "https://etherscan.io/tx/",
    },
    base: {
      name: "Basescan",
      address: "https://basescan.org/address/",
      tx: "https://basescan.org/tx/",
    },
    arbitrum: {
      name: "Arbiscan",
      address: "https://arbiscan.io/address/",
      tx: "https://arbiscan.io/tx/",
    },
    polygon: {
      name: "Polygonscan",
      address: "https://polygonscan.com/address/",
      tx: "https://polygonscan.com/tx/",
    },
  };

export function explorerAddressUrl(
  chain: string | null | undefined,
  address: string,
) {
  const e = EXPLORERS[(chain ?? "").toLowerCase()];
  return e ? `${e.address}${address}` : null;
}

export function explorerTxUrl(
  chain: string | null | undefined,
  tx: string,
) {
  const e = EXPLORERS[(chain ?? "").toLowerCase()];
  return e ? `${e.tx}${tx}` : null;
}

export function explorerName(chain: string | null | undefined) {
  const e = EXPLORERS[(chain ?? "").toLowerCase()];
  return e?.name ?? "Explorer";
}
