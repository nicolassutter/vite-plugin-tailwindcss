import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'black',
        'base-100': 'gray',
      },
    },
  },
  plugins: [],
} satisfies Config
