import { defineConfig } from 'vite'
import { vitePluginTailwindcss } from 'vite-plugin-tailwindcss'

export default defineConfig({
  plugins: [vitePluginTailwindcss()],
})
