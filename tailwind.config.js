/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [
    // eslint-disable-next-line global-require
    require("nativewind/preset"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
