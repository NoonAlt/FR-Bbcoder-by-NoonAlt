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
        lg: '1075px',
      },
      maxWidth: {
        lg: '1075px',
      },
    },
  },
  plugins: [],
};