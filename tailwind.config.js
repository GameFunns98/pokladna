/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neonYellow: "#FFD633",
        neonOrange: "#FF7F11",
        darkWood: "#2e2b26",
      },
      boxShadow: {
        neonGlow: "0 0 10px #FFD633, 0 0 20px #FF7F11",
      },
    },
  },
  plugins: [],
};