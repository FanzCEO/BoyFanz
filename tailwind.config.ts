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
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        display: ["Bebas Neue", "Teko", "sans-serif"],
        heading: ["Bebas Neue", "Teko", "sans-serif"],
        industrial: ["Anton", "Barlow Condensed", "sans-serif"],
        fight: ["Russo One", "Righteous", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          "0%": {
            "background-position": "-200% 0",
          },
          "100%": {
            "background-position": "200% 0",
          },
        },
        pulse: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-right": {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "glow": {
          "0%, 100%": {
            "box-shadow": "0 0 15px rgba(255, 0, 0, 0.5), 0 0 30px rgba(255, 0, 0, 0.3)",
          },
          "50%": {
            "box-shadow": "0 0 25px rgba(255, 0, 0, 0.7), 0 0 50px rgba(255, 0, 0, 0.4)",
          },
        },
        "neon-flicker": {
          "0%, 18%, 22%, 25%, 53%, 57%, 100%": {
            opacity: "1",
          },
          "20%, 24%, 55%": {
            opacity: "0.7",
          },
        },
        "fight-pulse": {
          "0%, 100%": {
            "text-shadow": "0 0 10px rgba(255, 0, 0, 1), 0 0 20px rgba(255, 0, 0, 0.8)",
          },
          "50%": {
            "text-shadow": "0 0 20px rgba(255, 0, 0, 1), 0 0 40px rgba(255, 0, 0, 0.9)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
        pulse: "pulse 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 8s ease-in-out infinite",
        "fight-pulse": "fight-pulse 3s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 15px rgba(255, 0, 0, 0.5), 0 0 30px rgba(255, 0, 0, 0.3)",
        "glow-lg": "0 0 25px rgba(255, 0, 0, 0.7), 0 0 50px rgba(255, 0, 0, 0.4)",
        "glow-xl": "0 0 40px rgba(255, 0, 0, 0.8), 0 0 80px rgba(255, 0, 0, 0.5)",
        "golden-glow": "0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)",
        neon: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
        "fight-ring": "0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.3), inset 0 0 15px rgba(255, 0, 0, 0.1)",
        steel: "0 8px 32px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 0, 0, 0.1)",
      },
      textShadow: {
        neon: "0 0 10px currentColor",
        "neon-strong": "0 0 10px currentColor, 0 0 20px currentColor",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-shadow-neon': {
          textShadow: '0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.4)',
        },
        '.text-shadow-neon-strong': {
          textShadow: '0 0 5px #fff, 0 0 10px rgba(255, 0, 0, 1), 0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6)',
        },
        '.text-shadow-golden': {
          textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)',
        },
        '.text-shadow-fight': {
          textShadow: '0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)',
        },
        '.bg-gradient-neon': {
          background: 'linear-gradient(135deg, #ff0000 0%, hsl(45, 90%, 60%) 100%)',
        },
        '.bg-gradient-red-golden': {
          background: 'linear-gradient(135deg, #ff0000 0%, hsl(45, 90%, 60%) 100%)',
        },
        '.bg-gradient-fight': {
          background: 'linear-gradient(135deg, rgba(20, 0, 0, 0.9) 0%, rgba(10, 0, 0, 0.95) 100%)',
        },
        '.border-gradient-neon': {
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(#000, #000), linear-gradient(135deg, #ff0000, hsl(45, 90%, 60%))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        },
        '.border-golden-glow': {
          border: '2px solid hsl(45, 90%, 60%)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        },
        '.border-blood-glow': {
          border: '2px solid #ff0000',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.5), 0 0 40px rgba(255, 0, 0, 0.3)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config;
