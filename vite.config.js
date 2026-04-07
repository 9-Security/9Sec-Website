import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                arsenal: resolve(__dirname, 'arsenal.html'),
                contact: resolve(__dirname, 'contact.html'),
                dmarc: resolve(__dirname, 'dmarc-analyzer.html'),
                governance: resolve(__dirname, 'governance-app.html'),
                services: resolve(__dirname, 'services.html'),
                smtp: resolve(__dirname, 'smtp-check.html'),
                portal: resolve(__dirname, '9sec-p6x-portal.html'),
                dns: resolve(__dirname, 'helix-dns-center.html'),
            },
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
