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
          bg: '#07100B',
          panel: '#101B13',
          panelBorder: '#1A2C1E',
          panelMuted: '#0C160F',
          military: '#263F2B',
          militaryLight: '#325338',
          olive: '#596B3A',
          oliveLight: '#72884A',
          khaki: '#B5A47A',
          khakiLight: '#D6C8A4',
          text: '#E7E9E2',
          textMuted: '#8B9B8E',
          warning: '#D39B32',
          warningBg: 'rgba(211, 155, 50, 0.12)',
          critical: '#C43C3C',
          criticalBg: 'rgba(196, 60, 60, 0.15)',
          success: '#3FA34D',
          successBg: 'rgba(63, 163, 77, 0.12)',
          cyan: '#3E92CC',
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
