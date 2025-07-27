import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Configurações para produção
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    }
  },
  
  // Preview para testes locais
  preview: {
    port: 3000,
    host: true
  },
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
