/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: নিচের লাইনে './app' ফোল্ডারটি যোগ করা হয়েছে
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
