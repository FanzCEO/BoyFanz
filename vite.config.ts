import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: ['es2020', 'safari14'], // Safari compatibility
    // Bundle optimization
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // UI components
            if (id.includes('@radix-ui/')) {
              return 'ui-vendor';
            }
            // Form handling
            if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('/zod/')) {
              return 'form-vendor';
            }
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }
            // Date handling
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
          }
        },
        // Smaller chunk names
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    target: 'es2020', // Safari 14+ compatible
    // Keep console for debugging - restore drop after fixing
    // drop: ['console', 'debugger'],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
