/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        academy: {
          deep: "#0f172a",
          card: "#1e293b",
          primary: "#0ea5e9",
          secondary: "#06b6d4",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(14, 165, 233, 0.35)",
        "glow-sm": "0 0 24px -8px rgba(6, 182, 212, 0.3)",
        float: "0 12px 40px -12px rgba(15, 23, 42, 0.65), 0 0 1px rgba(148, 163, 184, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
