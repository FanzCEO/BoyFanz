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
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom'],
          // UI components
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          // Form handling
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Charts & visualization
          'chart-vendor': ['recharts'],
          // Date handling
          'date-vendor': ['date-fns'],
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
    // Remove console.log in production
    drop: ['console', 'debugger'],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
