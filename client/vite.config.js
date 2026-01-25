import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'logo.png', 'robots.txt'],
            manifest: {
                name: 'Stashly - Digital Resource Manager',
                short_name: 'Stashly',
                description: 'Organize your digital resources in one place',
                theme_color: '#18191a',
                background_color: '#18191a',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
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
