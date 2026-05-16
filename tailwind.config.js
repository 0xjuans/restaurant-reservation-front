// Configuración de Tailwind CSS v3
// content: rutas donde Tailwind escanea clases para incluirlas en el bundle
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        cream:      '#FAFAF7',
        'cream-dark': '#F2EDE4',
        gold:       '#C9A84C',
        'gold-dark': '#A67C35',
        charcoal:   '#1A1A1A',
        'warm-gray': '#6B6560',
        border:     '#E0D8CC',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
