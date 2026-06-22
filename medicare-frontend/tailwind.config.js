/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // important
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#22C55E",
        neutralBg: "#F9FAFB",
        surface: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#64748B",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
