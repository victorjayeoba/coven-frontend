import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background layers
        base: "#0b0e14",
        sidebar: "#0a0d12",
        surface: "#121620",
        elevated: "#1a1f2e",
        input: "#0d1119",
        "row-hover": "#1a1f2e",

        // Borders
        border: "#1e2636",
        "border-strong": "#2c3648",
        divider: "#1a222e",

        // Text
        "text-primary": "#e4eaf2",
        "text-secondary": "#9ba8bd",
        "text-muted": "#5d6a80",
        "text-disabled": "#3b4558",

        // Brand
        primary: {
          DEFAULT: "#3cc47b",
          hover: "#4ed88c",
          pressed: "#2ba268",
          faint: "#3cc47b18",
        },

        // Semantic
        gain: "#3cc47b",
        loss: "#ef4a5f",
        warning: "#f5a524",
        info: "#5b9bff",

        // Chains
        chain: {
          solana: "#14f195",
          bsc: "#f0b90b",
          eth: "#627eea",
          base: "#0052ff",
          arbitrum: "#28a0f0",
          polygon: "#8247e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-space)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      fontSize: {
        micro: ["11px", { lineHeight: "14px", letterSpacing: "0.05em" }],
        small: ["12px", { lineHeight: "16px" }],
        body: ["13px", { lineHeight: "18px" }],
        "body-lg": ["14px", { lineHeight: "20px" }],
        h2: ["15px", { lineHeight: "20px" }],
        h1: ["20px", { lineHeight: "26px" }],
        display: ["28px", { lineHeight: "34px" }],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
