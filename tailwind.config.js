/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soul Resonance 专用色彩系统
        'bg-space': '#050605',
        'text-primary': '#e0e4e2',
        'text-secondary': '#8f9693',
        'soul-gold': 'rgba(210, 190, 160, 0.9)',
        'soul-green': 'rgba(140, 160, 150, 0.8)',
        'soul-purple': 'rgba(180, 170, 190, 0.8)',
        'soul-blue': 'rgba(0, 240, 255, 0.8)',
        'soul-pink': 'rgba(255, 106, 194, 0.8)',
        'accent-line': 'rgba(255, 255, 255, 0.12)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'noto-serif': ['Noto Serif SC', 'serif'],
      },
      animation: {
        'particle-float': 'particleFloat 20s infinite linear',
        'wave-pulse': 'wavePulse 2s infinite ease-in-out',
        'collapse': 'collapse 0.8s ease-out forwards',
        'typewriter': 'typewriter 3s steps(30) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
      },
      keyframes: {
        particleFloat: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -15px)' },
          '50%': { transform: 'translate(-5px, -25px)' },
          '75%': { transform: 'translate(-15px, -10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        wavePulse: {
          '0%, 100%': { scaleY: '0.3' },
          '50%': { scaleY: '1' },
        },
        collapse: {
          'from': { transform: 'scale(1)', filter: 'blur(0px)' },
          'to': { transform: 'scale(0.92)', filter: 'blur(5px)' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'noise-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}