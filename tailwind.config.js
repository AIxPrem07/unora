/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4f1e8",
        primary: "#1a1a18",
        muted: "#9a9585",
        accent: "#c5d89d",
        surface: "#ffffff",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0, 0, 0, 0.06)",
        floating: "0 8px 32px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
