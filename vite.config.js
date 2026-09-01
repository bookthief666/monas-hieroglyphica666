import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Relative base so the static build works on GitHub Pages / any sub-path host.
  base: './',
  plugins: [react()],
  build: {
    // Code-split the heavy WebGL stack into its own chunk so the initial
    // (text-first) experience stays light; the 3D Monad is lazy-loaded.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
});
