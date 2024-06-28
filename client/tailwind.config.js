/** @type {import('tailwindcss').Config} */
export default [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {},
};
export const plugins = [
  require('@tailwindcss/line-clamp'),
  // ...
];