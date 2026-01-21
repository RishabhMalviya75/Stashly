import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * ==================
 * 
 * 📚 LEARNING POINT:
 * Vite is a modern build tool that's MUCH faster than Create React App.
 * It uses native ES modules during development (no bundling needed!)
 * and Rollup for production builds.
 */
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        // Proxy API requests to the backend (avoids CORS during development)
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
})
