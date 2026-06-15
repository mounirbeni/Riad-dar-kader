/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: { DEFAULT: '#8B3A2A', dark: '#6B2D1F', light: '#A84D3B' },
        brass: { DEFAULT: '#B8943F', light: '#D4B06A' },
        sand: { DEFAULT: '#F5F0E8', dark: '#EDE6D6' },
        ink: '#1A1A1A',
        muted: '#7A6A58',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
