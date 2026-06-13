import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          DEFAULT: "#F5F0E8",
          50: "#FBF9F4",
          100: "#F5F0E8",
          200: "#EAE1D2",
          300: "#DCCDB5",
        },
        terracotta: {
          DEFAULT: "#8B3A2A",
          light: "#A8513F",
          dark: "#6E2B1F",
        },
        brass: {
          DEFAULT: "#B8943F",
          light: "#CBAC5E",
          dark: "#977829",
        },
        ink: "#1A1A1A",
        muted: "#7A6A58",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(26, 26, 26, 0.18)",
        card: "0 4px 24px -8px rgba(139, 58, 42, 0.15)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      backgroundImage: {
        "zellige": "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='none' stroke='%23B8943F' stroke-width='0.5' opacity='0.12'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
