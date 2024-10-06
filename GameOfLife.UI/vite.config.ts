import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const apiTarget =
  process.env.services__gameoflifeapi__http__0 ||
  process.env.services__gameoflifeapi__https__0;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: parseInt(process.env.PORT + '') || 4001,
        proxy: {
            // Proxy all requests starting with /api to api
            '/api': {
                target: apiTarget,  // Target API (from environment variable)
                changeOrigin: true,  // Handle cross-origin requests
                rewrite: (path) => path.replace(/^\/api/, ''),  // Rewrite /api to the root
                secure: false,  // Ignore SSL issues for self-signed certificates
            },
        },
    },
    css: {
        devSourcemap: false,
    }
})
