/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm keepsake base
        bg: '#FAF3EC',
        surface: '#FFFFFF',
        'surface-warm': '#FFF8F2',
        'surface-container': '#F3EDE7',
        'surface-variant': '#E8E1DC',
        // Coral / espresso
        primary: '#984631', // espresso-coral (CTA, links, active)
        'primary-container': '#E8846B', // coral
        'primary-soft': '#FBE7E0',
        'on-primary': '#FFFFFF',
        // Ink & muted
        ink: '#2D2926',
        muted: '#88726D',
        'muted-soft': '#9B9088',
        // Pastel "sticker" accents
        'pastel-mint': '#BEE1D4',
        'pastel-lavender': '#D8D2EB',
        'pastel-blue': '#C4E1F6',
        'tape-yellow': '#F9E392',
        // Secondary/tertiary from design tokens
        secondary: '#655689',
        tertiary: '#356668',
        error: '#BA1A1A',
        'error-container': '#FFDAD6',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Pretendard', 'system-ui', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        blob: '60% 40% 50% 50% / 40% 50% 50% 60%',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(45, 41, 38, 0.08)',
        'glow-primary': '0 8px 30px rgba(152, 70, 49, 0.15)',
        'glow-lavender': '0 8px 30px rgba(101, 86, 137, 0.15)',
        'glow-mint': '0 8px 30px rgba(53, 102, 104, 0.15)',
        polaroid: '0 10px 25px rgba(45, 41, 38, 0.10)',
      },
      keyframes: {
        'float-slow': {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(4deg)' },
        },
        run: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(2px) rotate(4deg)' },
          '50%': { transform: 'translateX(0) rotate(0)' },
          '75%': { transform: 'translateX(-2px) rotate(-4deg)' },
          '100%': { transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'float-slow': 'float-slow 4s ease-in-out infinite',
        run: 'run 1.2s ease-in-out infinite',
        'toast-in': 'toast-in 0.24s ease-out',
      },
    },
  },
  plugins: [],
}
