// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'rise-slow': 'rise-slow 20s ease-in infinite',
        'float-horizontal': 'float-horizontal 15s ease-in-out infinite',
      },
      keyframes: {
        'rise-slow': {
          '0%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0.1',
          },
          '10%': {
            opacity: '0.3',
          },
          '90%': {
            opacity: '0.2',
          },
          '100%': {
            transform: 'translateY(-100vh) scale(0.8)',
            opacity: '0',
          },
        },
        'float-horizontal': {
          '0%, 100%': {
            transform: 'translateX(-20px) scale(1)',
            opacity: '0.05',
          },
          '50%': {
            transform: 'translateX(20px) scale(1.1)',
            opacity: '0.1',
          },
        },
      }
    },
  },
  plugins: [],
}