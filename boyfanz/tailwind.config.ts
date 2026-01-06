import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        none: "0",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // SEX DEMON PALETTE
        demon: {
          black: "#050505",
          void: "#0a0505",
          blood: "#8B0000",
          crimson: "#CC0000",
          fire: "#ff2200",
          ember: "#ff4400",
          gold: "#c9a227",
          amber: "#b8860b",
          flesh: "#d4a574",
          smoke: "#1a1212",
          ash: "#2a2020",
          steel: "#3a3535",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Bebas Neue", "Oswald", "sans-serif"],
        heading: ["Bebas Neue", "Anton", "sans-serif"],
        body: ["Inter", "sans-serif"],
        masculine: ["Oswald", "Anton", "sans-serif"],
      },
      boxShadow: {
        demon: "0 0 20px rgba(139, 0, 0, 0.5), 0 0 40px rgba(139, 0, 0, 0.3)",
        "demon-lg": "0 0 30px rgba(255, 34, 0, 0.5), 0 0 60px rgba(139, 0, 0, 0.3)",
        gold: "0 0 15px rgba(201, 162, 39, 0.4), 0 0 30px rgba(201, 162, 39, 0.2)",
        void: "inset 0 0 30px rgba(0, 0, 0, 0.8)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        heatPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        emberGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 0, 0, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 34, 0, 0.6), 0 0 60px rgba(139, 0, 0, 0.3)" },
        },
        throb: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        heat: "heatPulse 4s ease-in-out infinite",
        ember: "emberGlow 2s ease-in-out infinite",
        throb: "throb 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
