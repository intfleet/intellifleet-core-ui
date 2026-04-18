import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
// import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  console.log("MODE:", mode);

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      // tsconfigPaths(), // still useful for syncing tsconfig paths
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      open: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});