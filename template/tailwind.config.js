/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          '80': 'color-mix(in srgb, var(--primary-color) 80%, transparent)'
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          '80': 'color-mix(in srgb, var(--secondary-color) 80%, transparent)'
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

