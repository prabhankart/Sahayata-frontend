import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5F5',       // A soft, creamy background
        surface: '#FFFFFF',     // Pure white for cards to pop
        primary: '#6366F1',     // A slightly softer, modern indigo
        'primary-hover': '#4F46E5',
        secondary: '#111827',   // A rich, dark color for text and elements
        muted: '#6B7280',       // A gentle gray for secondary text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif', ...fontFamily.sans],
      },
      animation: {
        blob: "blob 20s infinite",
        gradient: "gradient 15s ease infinite",
        "text-gradient": "text-gradient 5s ease infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "text-gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
}
