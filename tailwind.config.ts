import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "xxl": "2rem",
        "xxxl": "2.5rem",
      },
      spacing: {
        "18": "4.5rem",
        "20": "5rem",
      },
      colors: {
        basarili: "#4CAF50",
        uyari: "#FF9800",
        hata: "#F44336",
        bilgi: "#2196F3",
      },
    },
  },
  plugins: [],
};

export default config;
