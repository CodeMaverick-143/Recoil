// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwind()],
    },
    integrations: [react()],
});
