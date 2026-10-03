/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vyomix: {
          bg: '#F7F8F4',
          card: '#FFFFFF',
          cardBorder: '#D8DFD5',
          borderMuted: '#E2E8DF',
          primary: '#355E3B',       // Deep Army Green
          primaryDark: '#1F3D27',   // Dark Army Green
          olive: '#6B7444',         // Olive Green
          khaki: '#B5A36A',         // Muted Khaki
          sage: '#E8EEE5',          // Light Sage
          sageMuted: '#F0F4EE',
          text: '#1F2933',          // Dark Charcoal text
          textMuted: '#52606D',     // Slate/Sage Muted
          critical: '#B42318',      // Critical Red
          criticalBg: '#FEE4E2',
          criticalBorder: '#FDA29B',
          high: '#C2410C',          // High Orange
          highBg: '#FFEDD5',
          highBorder: '#FDBA74',
          medium: '#A16207',        // Medium Amber
          mediumBg: '#FEF08A',
          mediumBorder: '#FDE047',
          success: '#2F6B3C',       // Army Success Green
          successBg: '#E8F5E9',
          successBorder: '#A5D6A7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        tactical: ['Chakra Petch', 'Orbitron', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'tactical-grid': 'linear-gradient(to right, rgba(38, 63, 43, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(38, 63, 43, 0.15) 1px, transparent 1px)',
        'radar-conic': 'conic-gradient(from 0deg at 50% 50%, rgba(89, 107, 58, 0.25) 0deg, transparent 60deg, transparent 360deg)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
