/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors:{
        // theme:"#FAE011"
      },
      textColor:{
        "main":"#1f0503"
      },
      height:{
        "15":"60px"
      },
      lineHeight:{
        "15":"60px"
      },
      backgroundColor:{
        "1":"#f1e7e7"
      },
      borderColor:{
        '1':"#3e0d09"
      }
    },
  },
  plugins: [],
}
