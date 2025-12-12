// frontend/vite.config.js (KODE JAMINAN MUTLAK)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; 
import path from 'path';

export default defineConfig({
  plugins: [react()], 
  css: {
    // Tambahkan konfigurasi ini untuk memastikan Vite memuat CSS Anda
    preprocessorOptions: {
      css: {
        // Path ke file CSS global Anda
        additionalData: `@import "./src/index.css";`, 
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- INI KUNCINYA
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
});