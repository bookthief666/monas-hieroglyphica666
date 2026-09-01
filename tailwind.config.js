/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          gold: '#ffdf73',
          red: '#ff4444',
        },
        parchment: '#fcf8eb',
      },
      fontFamily: {
        blackletter: ['UnifrakturMaguntia', 'cursive'],
        medieval: ['MedievalSharp', 'cursive'],
        script: ['Petit Formal Script', 'cursive'],
        roman: ['IM Fell English', 'serif'],
      },
    },
  },
  plugins: [],
};
