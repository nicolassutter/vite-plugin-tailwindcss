import { defineConfig } from 'tsup'

const IS_DEV = process.env.NODE_ENV === 'development'
// const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  silent: IS_DEV,
})
