/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 60% - Primary Blue (like Trello)
        primary: {
          50: '#E6F2FF',
          100: '#B3D9FF',
          200: '#80C1FF',
          300: '#4DA8FF',
          400: '#1A90FF',
          500: '#0079BF', // Main
          600: '#006099',
          700: '#004873',
          800: '#00304D',
          900: '#001826',
        },
        // 30% - Neutral Gray
        neutral: {
          50: '#FAFBFC',
          100: '#F4F5F7',
          200: '#EBECF0',
          300: '#DFE1E6',
          400: '#C1C7D0',
          500: '#B3BAC5',
          600: '#A5ADBA',
          700: '#97A0AF',
          800: '#8993A4',
          900: '#7B8699',
        },
        // 10% - Accent Orange
        accent: {
          50: '#FFF4E6',
          100: '#FFE4B3',
          200: '#FFD380',
          300: '#FFC34D',
          400: '#FFB31A',
          500: '#FF9F1A', // Main
          600: '#E68F00',
          700: '#BF7700',
          800: '#995F00',
          900: '#734700',
        },
        success: '#61BD4F',
        warning: '#F2D600',
        error: '#EB5A46',
        info: '#00C2E0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'modal': '0 8px 16px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'card': '8px',
        'button': '4px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
