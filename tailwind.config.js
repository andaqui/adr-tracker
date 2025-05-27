/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./ui/src/**/*.{js,jsx,ts,tsx}",
    "./ui/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'adr-accepted': '#28a745',
        'adr-proposed': '#17a2b8',
        'adr-rejected': '#dc3545',
        'adr-deprecated': '#6c757d',
        'adr-unknown': '#6c757d',
      }
    },
  },
  plugins: [],
}
