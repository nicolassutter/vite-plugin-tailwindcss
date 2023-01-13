# vite-plugin-tw

> ✨ (almost) No config integration for Tailwind CSS with [Vite](https://github.com/vitejs/vite).

## Installation

> Use the package manager of your choice

```sh
npm install --save-dev vite-plugin-tw
```

### 2. Vite config

```ts
import vitePluginTW from 'vite-plugin-tw'

export default {
  plugins: [
    // ...
    vitePluginTW({
        // ...options
    }),
  ],
}
```

### 3. Tailwind CSS config file

- `<project_root>/tailwind.config.ts` (esm)
- `<project_root>/tailwind.config.js` (esm/cjs)
- `<project_root>/tailwind.config.cjs` (cjs)
- `<project_root>/tailwind.config.mjs` (esm)

### 4. Postcss

You can now remove `autoprefixer`, `tailwindcss` and `tailwindcss/nesting` from your postcss config (if you had them in). This is all handled by the plugin now.

### 5. .gitignore

Add `.vite-plugin-tw` to your .gitignore, see [#what-the-plugin-actually-does](#what-the-plugin-actually-does).

### That's it, run your vite dev server

```sh
npm run dev
```

## Configuration

The plugin has a few options, documented with TS / JSDoc.

All the available options are defined [here](packages/vite-plugin-tw/types/index.d.ts).

## Example

An example is available [here](packages/playground)

## What the plugin actually does

The plugin finds the first valid Tailwind CSS config file (although it allows more file extensions, see list above), converts it to CJS with [esbuild](https://esbuild.github.io/) and saves it in the `<project_root>/.vite-plugin-tw` directory. This is the actual config that will be used by Tailwind CSS.

## But why ?

Well, I really like Tailwind but I got annoyed at the lack of support for `.ts` config files.

Having a `.ts` file as a config allows for a better DX overall, as well as having access to `satisfies` for better autocomplete in editors when accessing the theme in actual application code.

## Thanks 💚

- [Windi CSS](https://windicss.org/), took quite a bit of inspiration.
- [esbuild](https://esbuild.github.io/)
- [tsup](https://tsup.egoist.dev/)
- [Vite](https://vitejs.dev/)
