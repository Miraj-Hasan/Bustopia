import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    https: true,           // ✅ Now works!
    host: 'localhost',
    port: 4000,
  },
  plugins: [react(), mkcert()],
});
