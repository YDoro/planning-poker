import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

delete process.env['CommonProgramFiles(x86)'];
delete process.env['ProgramFiles(x86)'];
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), EnvironmentPlugin('all'), tsconfigPaths()],
  server: {
    host: true,
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
