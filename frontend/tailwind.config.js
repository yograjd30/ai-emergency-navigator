/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        sos: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-secondary)',
          input: 'var(--bg-tertiary)',
          glass: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          glow: 'var(--accent-glow)',
          subtle: 'var(--accent-subtle)',
          emergency: 'var(--emergency)',
          'emergency-glow': 'var(--emergency-glow)',
          critical: 'var(--critical)',
          'critical-glow': 'var(--critical-glow)',
          success: 'var(--success)',
          info: 'var(--info)',
        },
        severity: {
          critical: 'var(--severity-critical)',
          urgent: 'var(--severity-urgent)',
          standard: 'var(--severity-standard)',
          info: 'var(--severity-info)',
        },
        cat: {
          police: 'var(--cat-police)',
          fire: 'var(--cat-fire)',
          ambulance: 'var(--cat-ambulance)',
          women: 'var(--cat-women)',
          child: 'var(--cat-child)',
          cyber: 'var(--cat-cyber)',
          disaster: 'var(--cat-disaster)',
          mental: 'var(--cat-mental)',
          general: 'var(--cat-general)',
        },
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
        'glow-accent': '0 0 20px var(--accent-glow)',
        'glow-emergency': '0 0 20px var(--emergency-glow)',
        'glow-critical': '0 0 20px var(--critical-glow)',
      },
      animation: {
        'pulse-emergency': 'pulse-emergency 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-mesh': 'gradient-mesh 10s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-emergency': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245, 158, 11, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-mesh': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
