import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "accent-green": "var(--accent-green)",
        "accent-green-light": "var(--accent-green-light)",
        "accent-gold": "var(--accent-gold)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        righteousness: "var(--righteousness)",
        respect: "var(--respect)",
        responsibility: "var(--responsibility)",
        "flag-muraaqabah": "var(--flag-muraaqabah)"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
        "arabic-ui": ["var(--font-arabic-ui)", "serif"]
      },
      boxShadow: {
        shell: "0 24px 60px rgba(21, 41, 30, 0.08)",
        card: "0 10px 30px rgba(14, 28, 22, 0.06)"
      },
      backgroundImage: {
        "scholarly-grid":
          "radial-gradient(circle at 1px 1px, rgba(45, 106, 79, 0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
