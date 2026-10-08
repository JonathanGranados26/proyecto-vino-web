/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ec7a94',
          500: '#df4f72',
          600: '#cd2f57',
          700: '#ac1d44',
          800: '#8f1c3c',
          900: '#7a1d39',
          950: '#44081b',
        },
      },
    },
  },
  plugins: [],
};