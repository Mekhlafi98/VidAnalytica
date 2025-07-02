import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const repoName = "VidAnalytica";

export default defineConfig(({ mode }) => ({
  base: `/${repoName}/`,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:4444',
        changeOrigin: true,
      }
    } : undefined,
    allowedHosts: ['localhost', '.pythagora.ai'],
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/public/**', '**/log/**']
    }
  },
}));
