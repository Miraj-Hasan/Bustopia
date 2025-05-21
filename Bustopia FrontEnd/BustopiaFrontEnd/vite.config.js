import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // use IPv4 instead of ::1 (IPv6)
    port: 3000          // optional: change to a known free port
  }
})
