/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // brand palette centered on #ff5c54
        brand: {
          50: '#fff5f5',
          100: '#ffe6e6',
          200: '#ffbdb9',
          300: '#ff918b',
          400: '#ff6f60',
          500: '#ff5c54',
          600: '#e64f48',
          700: '#bf3f39',
          800: '#99322d',
          900: '#7a261f'
        }
      }
    }
  },
  plugins: []
}
