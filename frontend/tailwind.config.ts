/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#06B6D4",
        accent: "#F59E0B",
        success: "#10B981",
        danger: "#EF4444"
      }
    }
  },
  plugins: []
};
