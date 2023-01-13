import { defineConfig } from 'vite'
import { vitePluginTailwindcss } from 'vite-plugin-tw'

export default defineConfig({
  plugins: [
    vitePluginTailwindcss({
      nesting: 'postcss-nesting',
    }),
  ],
})
