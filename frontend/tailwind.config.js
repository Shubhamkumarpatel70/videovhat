/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'sf-pro': ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Modern color palette with better gradients
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Gradient colors for easy access
        gradient: {
          'blue-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'purple-pink': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          'cyan-blue': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          'green-cyan': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          'orange-red': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-diagonal': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-rainbow': 'linear-gradient(135deg, #667eea, #764ba2, #a855f7, #ec4899)',
        
        // Glass morphism backgrounds
        'glass-primary': 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        'glass-success': 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        'glass-warning': 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
        
        // Pattern backgrounds
        'hero-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'dot-pattern': "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')",
        'grid-pattern': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.02\" fill-rule=\"evenodd\"%3E%3Cpath d=\"m0 40l40-40h-40v40zm40 0v-40h-40l40 40z\"/%3E%3C/g%3E%3C/svg%3E')",
      },
      animation: {
        // Basic animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        
        // Special effects
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'bounce-fast': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // Custom animations
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-slow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'wave': 'wave 2s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        fadeInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
          },
        },
        borderGlow: {
          '0%, 100%': { 
            borderColor: 'rgba(14, 165, 233, 0.3)',
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.2)',
          },
          '50%': { 
            borderColor: 'rgba(14, 165, 233, 0.6)',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
          },
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-1000px 0',
          },
          '100%': { 
            backgroundPosition: '1000px 0',
          },
        },
        wave: {
          '0%, 60%, 100%': { 
            transform: 'scaleY(0.4)',
          },
          '20%': { 
            transform: 'scaleY(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        // Glass morphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        
        // Glow effects
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.3)',
        'glow-md': '0 0 20px rgba(14, 165, 233, 0.4)',
        'glow-lg': '0 0 40px rgba(14, 165, 233, 0.3)',
        'glow-xl': '0 0 60px rgba(14, 165, 233, 0.2)',
        
        // Colored glows
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.5)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.5)',
        
        // Depth shadows
        'depth-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'depth-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'depth-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'depth-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      // Extended spacing for more granular control
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Border radius extensions
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Extended opacity
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      // NEW: Border color extensions for input fixes
      borderColor: {
        'transparent': 'transparent',
        'glass': 'rgba(255, 255, 255, 0.2)',
        'glass-focus': 'rgba(14, 165, 233, 0.5)',
      },
      // NEW: Outline extensions
      outline: {
        'none': ['2px solid transparent', '2px'],
        'glass': ['2px solid rgba(14, 165, 233, 0.5)', '2px'],
        'glass-sm': ['1px solid rgba(14, 165, 233, 0.5)', '1px'],
      },
      // NEW: Ring extensions for focus states
      ringColor: {
        'glass': 'rgba(14, 165, 233, 0.5)',
        'glass-light': 'rgba(14, 165, 233, 0.3)',
      },
      ringWidth: {
        'glass': '2px',
        'glass-sm': '1px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom plugin for glass morphism utilities
    function({ addUtilities, addBase }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.text-stroke': {
          '-webkit-text-stroke': '1px currentColor',
          'paint-order': 'stroke fill',
        },
        '.text-stroke-2': {
          '-webkit-text-stroke': '2px currentColor',
          'paint-order': 'stroke fill',
        },
        // NEW: Input focus utilities to fix line box issue
        '.input-focus-glass': {
          'outline': 'none',
          'border': 'none',
          'ring': '2px solid rgba(14, 165, 233, 0.5)',
          'box-shadow': '0 0 0 2px rgba(14, 165, 233, 0.5)',
        },
        '.no-outline': {
          'outline': 'none',
          'border': 'none',
          'box-shadow': 'none',
        },
        '.select-custom': {
          'appearance': 'none',
          'background-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          'background-position': 'right 0.5rem center',
          'background-repeat': 'no-repeat',
          'background-size': '1.5em 1.5em',
          'padding-right': '2.5rem',
        },
      }
      
      // Add base styles to reset input defaults
      addBase({
        'input, select, textarea': {
          'border': 'none',
          'outline': 'none',
          'box-shadow': 'none',
        },
        'input:focus, select:focus, textarea:focus': {
          'outline': 'none',
          'border': 'none',
          'boxShadow': '0 0 0 2px rgba(14, 165, 233, 0.5)',
        },
      })
      
      addUtilities(newUtilities)
    }
  ],
}