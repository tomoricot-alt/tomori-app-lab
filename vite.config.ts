import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages (https://<user>.github.io/tomori-app-lab/) 配下で動くよう相対パスにする
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
