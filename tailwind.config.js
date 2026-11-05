/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "uv-azul": "#002B5C",
        "uv-celeste": "#00A4E4",
      },
    },
  },
  plugins: [],
};
