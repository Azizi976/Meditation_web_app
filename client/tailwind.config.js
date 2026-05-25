/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sage:    { 50:'#f4f7f4',100:'#e3ece3',200:'#c7d9c7',300:'#9dbd9d',400:'#6f9b6f',500:'#4d7c4d',600:'#3a623a',700:'#2e4e2e',800:'#253f25',900:'#1e341e' },
        lavender:{ 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' },
        blush:   { 50:'#fff1f3',100:'#ffe4e8',200:'#fecdd6',300:'#fda4b5',400:'#fb7191',500:'#f43f6f',600:'#e11d52',700:'#be1246',800:'#9f1040',900:'#87103a' },
        sand:    { 50:'#fafaf7',100:'#f5f5ee',200:'#eeeede',300:'#e3e3ca',400:'#d3d3ae',500:'#bfbf90',600:'#a6a670',700:'#8a8a56',800:'#717145',900:'#5d5d38' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'calm-gradient': 'linear-gradient(135deg, #f5f3ff 0%, #e0f2fe 50%, #f4f7f4 100%)',
      },
      animation: {
        'breathe':    'breathe 4s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%,100%': { transform:'scale(1)',    opacity:'0.7' },
          '50%':     { transform:'scale(1.08)', opacity:'1'   },
        },
        float: {
          '0%,100%': { transform:'translateY(0)'   },
          '50%':     { transform:'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity:'1'   },
          '50%':     { opacity:'0.5' },
        },
      },
    },
  },
  plugins: [],
};

