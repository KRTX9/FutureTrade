/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy primary colors (kept for compatibility)
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Dark Theme Colors
        dark: {
          bg: "#0f0f0f", // Main background - deep dark
          surface: "#1a1a1a", // Surface elements - cards, inputs
          card: "#1e1e1e", // Card backgrounds
          hover: "#252525", // Hover states
          border: "#2a2a2a", // Borders
          accent: "#363636", // Accents
          text: "#e5e5e5", // Primary text
          "text-secondary": "#a3a3a3", // Secondary text
          muted: "#737373", // Muted/placeholder text
        },
        // Brand Colors
        brand: {
          primary: "#3b82f6", // Blue
          "primary-hover": "#2563eb",
          secondary: "#8b5cf6", // Purple
          "secondary-hover": "#7c3aed",
          success: "#10b981", // Green
          warning: "#f59e0b", // Orange
          error: "#ef4444", // Red
          info: "#06b6d4", // Cyan
        },
        // Status Colors
        status: {
          online: "#22c55e",
          away: "#f59e0b",
          busy: "#ef4444",
          offline: "#6b7280",
        },
      },
      boxShadow: {
        dark: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        "dark-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-dark": "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
