import { defineConfig } from 'vite';
import vercel from 'vite-plugin-vercel';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 8080
    },
    plugins: [
        vercel(),
        react()
    ],
})