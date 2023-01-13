import type { Options as AutoprefixerOptions } from 'autoprefixer'

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
