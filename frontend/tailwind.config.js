/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm coffee-shop palette: deep roasted browns, creams, and a toasted-orange accent
        coffee: {
          50: '#FBF6EF', // milk foam
          100: '#F4E9DA', // cream
          200: '#E6D2B5',
          300: '#D4B48C',
          400: '#B98A5D',
          500: '#8B5E34', // latte
          600: '#6B4226', // roasted brown (primary)
          700: '#4E2E1B',
          800: '#3A2214', // espresso
          900: '#24140C', // dark roast (near-black)
        },
        accent: {
          400: '#F0A868',
          500: '#E08838', // warm orange accent
          600: '#C56A1F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 14px rgba(58, 34, 20, 0.12)',
      },
    },
  },
  plugins: [],
};
