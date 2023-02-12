import path, { resolve } from 'node:path'
import fs from 'node:fs/promises'
import type { Plugin } from 'vite'
import { build } from 'esbuild'
import fg from 'fast-glob'
import type { Options } from '../types/index'
import { getPackageInfo } from 'local-pkg'

const OUTDIR = path.resolve(process.cwd(), '.vite-plugin-tw')
const OUTFILE = path.resolve(OUTDIR, '_tailwind.config.cjs')
const OUT_CONFIG_FILE = path.resolve(OUTDIR, 'tailwind.config.cjs')

async function generate({ watch, config }: { watch: boolean; config: string }) {
  let fullConfig = {}

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
          build.onEnd(async () => {
            const { default: cjsConfig } = await import(OUTFILE)
            const conf = 'default' in cjsConfig ? cjsConfig.default : cjsConfig

            const { default: resolveConfig } = await import(
              'tailwindcss/resolveConfig.js'
            )

            fullConfig = resolveConfig(conf)

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

  return {
    fullConfig,
    result,
  }
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

export const defaultConfig: Options = {}

export function vitePluginTW(config: Options = defaultConfig): Plugin {
  const pluginResult = plugin()
  const virtualModuleId = 'virtual:tw-config'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`

  /**
   * Writes a .d.ts file in the package's dir
   * declaring the tailwind config literal type.
   *
   * NOTE: Does not work with dependencies listed as "workspace:*" in pnpm
   */
  getPackageInfo('vite-plugin-tw').then(async (r) => {
    const awaitedPluginResult = await pluginResult

    if (r) {
      fs.writeFile(
        resolve(r.rootPath, 'types.d.ts'),
        [
          `declare module 'virtual:tw-config' {`,
          `  const conf: ${JSON.stringify(awaitedPluginResult.fullConfig)}`,
          `  export default conf`,
          `}`,
        ].join('\n'),
      )
    }
  })

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
      buildResult.result?.stop && buildResult.result.stop()
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    async load(id) {
      const buildResult = await pluginResult

      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(buildResult.fullConfig)};`
      }
    },
  }
}

export default vitePluginTW
