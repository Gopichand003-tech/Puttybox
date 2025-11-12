/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(-25%)' },
          '50%': { transform: 'translateX(25%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5%)' },
        },
        'pulse-smooth': {
        '0%, 100%': { opacity: '0.85' },
        '50%': { opacity: '1' },
      },
      animation: {
        'bounce-x': 'bounce-x 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-smooth': 'pulse-smooth 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
};
