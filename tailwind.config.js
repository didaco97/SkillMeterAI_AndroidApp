/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#F4F4F0',
        yellow: '#FFE45E',
        cyan: '#41DFFF',
        pink: '#FF6BB5',
        green: '#55E079',
        orange: '#FF9F1C',
        red: '#FF4F4F',
        violet: '#9B7CFF',
      },
      fontFamily: {
        mono: ['SpaceMono'],
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
};
