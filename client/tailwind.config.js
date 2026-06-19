/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          card: '#1a2332',
          elevated: '#243044',
          border: '#2d3a4f',
        },
        accent: {
          DEFAULT: '#00d4aa',
          muted: '#00a88a',
          gold: '#f5c518',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
