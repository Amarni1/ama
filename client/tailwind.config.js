/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ma: {
          gold: "#D4AF37",
          white: "#FFFFFF",
          black: "#0A0A0A",
          panel: "rgba(255, 255, 255, 0.08)"
        }
      },
      boxShadow: {
        glow: "0 0 25px rgba(212, 175, 55, 0.35)",
        card: "0 24px 60px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Segoe UI", "sans-serif"]
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top, rgba(212, 175, 55, 0.22), transparent 36%), linear-gradient(180deg, #fffaf0 0%, #f4ecd8 100%)"
      }
    }
  },
  plugins: []
};
