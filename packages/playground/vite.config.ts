import { defineConfig } from 'vite'
import vitePluginTW from 'vite-plugin-tw'

export default defineConfig({
  plugins: [
    vitePluginTW({
      nesting: 'postcss-nesting',
    }),
  ],
})
