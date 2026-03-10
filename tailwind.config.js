module.exports = {
  darkMode: 'class',
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./Pagina web/**/*.html",
    "./Pagina web/src/**/*.{js,ts,jsx,tsx}",
    "./Pagina web/public/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'principal': ['var(--fuente-principal)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
