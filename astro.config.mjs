// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://klauszellner1987.github.io',
  base: '/KyokushinKarateArrach',
  vite: {
    plugins: [tailwindcss()]
  }
});