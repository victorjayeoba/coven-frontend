"use client";

import dynamic from "next/dynamic";

// GridScan touches `window` + WebGL on mount — load client-only.
const GridScan = dynamic(
  () => import("@/components/GridScan").then((m) => m.GridScan),
  {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(60,196,123,0.08),transparent_60%)]" />
  ),
  },
);

export function HeroBackground() {
  return (
    <div className="absolute inset-0">
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#3a4256"
        gridScale={0.08}
        scanColor="#3CC47B"
        scanOpacity={0.35}
        enablePost
        bloomIntensity={0.5}
        chromaticAberration={0.002}
        noiseIntensity={0.012}
      />
    </div>
  );
}
