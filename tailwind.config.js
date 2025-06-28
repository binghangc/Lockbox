const nativewind = require('nativewind/preset');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewind],
  theme: {
    extend: {},
  },
  plugins: [],
};
