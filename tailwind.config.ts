import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0052a5, #0073e6)", // Faysal Bank Blue Gradient
        "gradient-dark": "linear-gradient(135deg, #0a1d3a, #1c2f5d)", // Dark Mode Gradient
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui()]
} satisfies Config;
