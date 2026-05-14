import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: [
          'ui-serif',
          'Georgia',
          '"Iowan Old Style"',
          '"Apple Garamond"',
          '"Times New Roman"',
          'serif',
        ],
      },
      colors: {
        // Vibrant teal-emerald for primary CTAs and brand surfaces.
        brand: {
          DEFAULT: "#0d9488", // teal-600
          fg: "#ffffff",
          muted: "#ccfbf1", // teal-100
          ink: "#0f766e", // teal-700
        },
        // Electric emerald for savings / positive accents — punchier than sage.
        savings: {
          DEFAULT: "#10b981", // emerald-500
          fg: "#ffffff",
          muted: "#d1fae5", // emerald-100
          ink: "#047857", // emerald-700
        },
        // Stone palette for restrained neutrals on glass surfaces.
        stone: {
          50: "#fafaf9",
          100: "rgba(255,255,255,0.6)",
          200: "rgba(15,30,28,0.08)",
          300: "rgba(15,30,28,0.16)",
        },
      },
      boxShadow: {
        card: "0 8px 32px rgba(13, 148, 136, 0.10), 0 2px 8px rgba(13, 148, 136, 0.06)",
        cardLift: "0 20px 60px rgba(13, 148, 136, 0.18), 0 6px 16px rgba(13, 148, 136, 0.10)",
        glow: "0 0 0 1px rgba(13, 148, 136, 0.10), 0 30px 80px rgba(13, 148, 136, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
