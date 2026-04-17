import { defineConfig, loadEnv } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  console.log("MODE:", mode);

  // const env = loadEnv(mode, process.cwd(), '');  
  // console.log("LOADED ENV FROM VITE:", env);

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tsconfigPaths()
    ],
  };
});