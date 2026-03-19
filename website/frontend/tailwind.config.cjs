/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'pacman-black': '#000000',
        'pacman-yellow': '#FFFF00',
        'wall-blue': '#0000FF',
        'ghost-red': '#FF0000',
        'ghost-pink': '#FFB8FF',
        'ghost-cyan': '#00FFFF',
        'ghost-magenta': '#FF00FF',
      },
      fontFamily: {
        heading: ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
};
