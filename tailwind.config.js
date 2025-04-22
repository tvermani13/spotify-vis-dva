/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
      },
    },
  },
  plugins: [],
}