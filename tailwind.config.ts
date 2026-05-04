import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kflick: {
          dark: '#0D0D0D',
          red: '#E50914',
          gold: '#F5C518',
          gray: '#1A1A1A',
          light: '#F5F5F5',
          border: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
