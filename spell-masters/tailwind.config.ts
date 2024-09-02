// tailwind.config.js
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        inter: ['var(--font-inter)'],
        figtree: ['var(--font-figtree)'],
        monda: ['var(--font-monda)'],
        kablammo: ['var(--font-kablammo)'],
        playpenSans: ['var(--font-playpen-sans)'],
        notoSans: ['var(--font-noto-sans)'],
        quicksand: ['var(--font-quicksand)'],
        shantellSans: ['var(--font-shantell-sans)'],
        eduTASBeginner: ['var(--font-edu-tas-beginner)'],
      },
    },
  },
  plugins: [],
};

export default config;