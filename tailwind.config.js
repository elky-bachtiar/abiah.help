/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2A2F6D',
          50: '#F0F1F8',
          100: '#E1E4F1',
          200: '#C3C8E3',
          300: '#A5ADD5',
          400: '#8791C7',
          500: '#6975B9',
          600: '#4B5AAB',
          700: '#2A2F6D',
          800: '#212654',
          900: '#181C3B',
        },
        secondary: {
          DEFAULT: '#F9B94E',
          50: '#FEF9F0',
          100: '#FDF2E1',
          200: '#FBE5C3',
          300: '#F9D8A5',
          400: '#F7CB87',
          500: '#F5BE69',
          600: '#F3B14B',
          700: '#F9B94E',
          800: '#E5A43E',
          900: '#D18F2E',
        },
        neutral: {
          DEFAULT: '#5B5F77',
          50: '#F7F8F9',
          100: '#F0F1F3',
          200: '#E1E3E7',
          300: '#D2D5DB',
          400: '#C3C7CF',
          500: '#B4B9C3',
          600: '#A5ABB7',
          700: '#969DAB',
          800: '#87909F',
          900: '#5B5F77',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};