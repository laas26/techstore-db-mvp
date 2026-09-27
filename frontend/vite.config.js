/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configura o plugin React, o servidor local, opções de build e testes.
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    port: 5173,
    host: true, // Necessário para funcionar bem dentro de containers Docker
    proxy: {
      '/api': {
        // Aponta para o nome oficial do container do backend na rede interna do Docker
        target: 'http://techstore_backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false, 
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
