module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#ff7614",
        secondary: "#27d39a",
        success: "#27d39a",
        error: "#f00000",
        background: "#000000",
        surface: "#182230",
        text: "#ffffff"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)"
      },
      fontFamily: {
        display: ["Inter", "system-ui", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
