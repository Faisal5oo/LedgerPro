/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          50: '#E7E9EF',
          100: '#C2C9D6',
          200: '#9AA6BC',
          300: '#7283A2',
          400: '#4A6088',
          500: '#233D6E',
          600: '#1C3259',
          700: '#152744',
          800: '#0E1B2F',
          900: '#070E1A',
        }
      }
    },
  },
  plugins: [],
}