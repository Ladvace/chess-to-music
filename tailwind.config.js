/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F2F2FF",
          100: "#DADCFF",
          200: "#B5B9FF",
          300: "#9396FF",
          400: "#7174FF",
          500: "#4F46E5",
          600: "#3B32CC",
          700: "#2A1FB3",
          800: "#1A0D9A",
          900: "#090080",
        },
        background: {
          50: "#2A2935",
          100: "#25242F",
          200: "#201F29",
          300: "#1B1A23",
          400: "#16151D",
          500: "#131221",
          600: "#0E0F1B",
          700: "#090A15",
          800: "#04050F",
          900: "#000009",
        },
        secondary: {
          50: "#2A2935",
          100: "#25242F",
          200: "#201F29",
          300: "#1B1A23",
          400: "#16151D",
          500: "#131221",
          600: "#0E0F1B",
          700: "#090A15",
          800: "#04050F",
          900: "#000009",
        },
        text: {
          50: "#F6F6FA",
          100: "#ECECE9",
          200: "#E2E2E8",
          300: "#D8D8D7",
          400: "#CECEC6",
          500: "#DFDEED",
          600: "#C4C4B5",
          700: "#BABAAC",
          800: "#B0B0A3",
          900: "#A6A69A",
        },
        accent: {
          50: "#EAEAF9",
          100: "#D4D4E9",
          200: "#BEBED9",
          300: "#A8A8C9",
          400: "#9292B9",
          500: "#9E9DC8",
          600: "#7C7CB0",
          700: "#666698",
          800: "#505080",
          900: "#3A3A68",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        body: { color: "#ffffff" },
      });
    },
  ],
};
