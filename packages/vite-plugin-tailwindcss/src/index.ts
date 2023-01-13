import path from 'node:path'
import fs from 'node:fs/promises'
import type { Plugin } from 'vite'
import { build } from 'esbuild'
import fg from 'fast-glob'

async function generate({ watch, config }: { watch: boolean; config: string }) {
  const dir = path.resolve(process.cwd(), '.vite')

  await build({
    format: 'cjs',
    // Bundle imports together
    bundle: true,
    // Don't bundle npm deps
    packages: 'external',
    write: true,
    entryPoints: [config],
    outfile: path.resolve(process.cwd(), dir, '_tailwind.config.cjs'),
    watch,
    plugins: [
      {
        name: 'on-end',
        setup(build) {
          build.onEnd(() => {
            fs.writeFile(
              path.resolve(dir, 'tailwind.config.cjs'),
              `const { default: config } = require('./_tailwind.config.cjs'); module.exports = config;`,
            )
          })
        },
      },
    ],
  })
}

async function plugin() {
  const TW_CONFIG_FILES = await fg(
    path.resolve(process.cwd(), 'tailwind.config.{js,cjs,ts,mjs}'),
  )

  const TW_CONFIG_FILE = TW_CONFIG_FILES.at(0)

  if (!TW_CONFIG_FILE) {
    throw new Error(
      'No Tailwind CSS config file was found. Please make sure you have placed a `tailwind.config.{js,cjs,ts,mjs}` at the root of your project.',
    )
  }

  generate({
    watch: process.env.NODE_ENV === 'development',
    config: TW_CONFIG_FILE,
  })
}

export function vitePluginTailwindcss(_config = {}): Plugin {
  plugin()

  return {
    name: 'vite-plugin-tailwindcss',
  }
}

export default vitePluginTailwindcss
