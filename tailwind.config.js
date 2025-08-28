import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1120px", "2xl": "1280px" } },
    extend: {
      colors: {
        cream: '#F5F5F5',
        surface: '#FFFFFF',
        primary: '#6366F1',
        'primary-hover': '#4F46E5',
        secondary: '#111827',
        muted: '#6B7280',
      },
      fontFamily: { sans: ['Inter', 'sans-serif', ...fontFamily.sans] },
      animation: {
        blob: "blob 20s infinite",
        gradient: "gradient 15s ease infinite",
        "text-gradient": "text-gradient 5s ease infinite",
        fade: "fade 300ms ease-in-out",
        pop: "pop 180ms ease-out",
      },
      keyframes: {
        blob: { "0%":{transform:"translate(0,0) scale(1)"},"33%":{transform:"translate(30px,-50px) scale(1.1)"},"66%":{transform:"translate(-20px,20px) scale(0.9)"},"100%":{transform:"translate(0,0) scale(1)"} },
        gradient: { "0%,100%":{backgroundPosition:"0% 50%"},"50%":{backgroundPosition:"100% 50%"} },
        "text-gradient": { "0%,100%":{backgroundPosition:"0% 50%"},"50%":{backgroundPosition:"100% 50%"} },
        fade: { from:{opacity:0,transform:"translateY(4px)"}, to:{opacity:1,transform:"translateY(0)"} },
        pop: { from:{transform:"scale(.98)"}, to:{transform:"scale(1)"} }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(17, 24, 39, 0.06)",
        card: "0 20px 40px -20px rgba(17,24,39,0.15)",
      },
      borderRadius: { xl2: "1.25rem" }
    },
  },
  plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/typography')],
}
