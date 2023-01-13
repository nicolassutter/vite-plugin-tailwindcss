import path from 'node:path'
import fs from 'node:fs/promises'
import type { Plugin } from 'vite'
import { build } from 'esbuild'
import fg from 'fast-glob'
import type { Options as AutoprefixerOptions } from 'autoprefixer'

const OUTDIR = path.resolve(process.cwd(), '.vite_plugin_tailwindcss')
const OUTFILE = path.resolve(process.cwd(), OUTDIR, '_tailwind.config.cjs')
const OUT_CONFIG_FILE = path.resolve(OUTDIR, 'tailwind.config.cjs')

async function generate({ watch, config }: { watch: boolean; config: string }) {
  const result = await build({
    format: 'cjs',
    // Bundle imports together
    bundle: true,
    // Don't bundle npm deps
    packages: 'external',
    write: true,
    entryPoints: [config],
    outfile: OUTFILE,
    watch,
    plugins: [
      {
        name: 'on-end',
        setup(build) {
          build.onEnd(() => {
            fs.writeFile(
              OUT_CONFIG_FILE,
              [
                `const TW_CONFIG = require('./_tailwind.config.cjs');`,
                `const config = 'default' in TW_CONFIG ? TW_CONFIG.default : TW_CONFIG`,
                `module.exports = config;`,
              ].join('\n'),
            )
          })
        },
      },
    ],
  })

  return result
}

async function plugin() {
  const TW_CONFIG_FILES = await fg(
    path.resolve(process.cwd(), 'tailwind.config.{js,cjs,ts,mjs}'),
  )

  const TW_CONFIG_FILE = TW_CONFIG_FILES.at(0)

  if (!TW_CONFIG_FILE) {
    throw new Error(
      'No Tailwind CSS config file was found. Please make sure that you have placed a `tailwind.config.{js,cjs,ts,mjs}` at the root of your project.',
    )
  }

  return generate({
    watch: process.env.NODE_ENV === 'development',
    config: TW_CONFIG_FILE,
  })
}
export type Options = {
  /**
   * @see https://tailwindcss.com/docs/using-with-preprocessors#nesting
   */
  nesting?: 'postcss-nested' | 'postcss-nesting'
  /**
   * Options to pass to autoprefixer
   *
   * @see https://github.com/postcss/autoprefixer#options
   */
  autoprefixerOptions?: AutoprefixerOptions
}

export const defaultConfig: Options = {}

export function vitePluginTailwindcss(config: Options = defaultConfig): Plugin {
  const pluginResult = plugin()

  return {
    name: 'vite-plugin-tw',

    async config() {
      const [
        { default: TailwindCSS },
        { default: TailwindCSSNesting },
        { default: autoprefixer },
      ] = await Promise.all([
        import('tailwindcss'),
        import(
          // @ts-expect-error untyped
          'tailwindcss/nesting/index.js'
        ),
        import('autoprefixer'),
      ])

      const plugins = [
        config.nesting ? TailwindCSSNesting(config.nesting) : undefined,
        TailwindCSS({
          config: OUT_CONFIG_FILE,
        }),
        autoprefixer(config.autoprefixerOptions ?? {}),
      ].filter((item) => item !== undefined)

      return {
        css: {
          postcss: {
            plugins,
          },
        },
      }
    },

    async closeWatcher() {
      const buildResult = await pluginResult
      buildResult?.stop && buildResult.stop()
    },
  }
}

export default vitePluginTailwindcss
