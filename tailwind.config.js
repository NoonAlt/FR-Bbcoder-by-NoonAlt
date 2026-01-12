module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{css,js,html}",
    "./js/**/*.js",
    "./*.html",
  ],
  theme: {
    extend: {
      screens: {
        lg: '546.25px',
      },
      maxWidth: {
        lg: '546.25px',
      },
    },
  },
  plugins: [],
};