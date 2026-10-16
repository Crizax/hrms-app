import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// Keep your existing plugins (e.g. the Tailwind plugin). No proxy is needed:
// the app calls the backend directly and the backend allows it via CORS.
export default defineConfig({
  plugins: [react(), tailwindcss(),],
})
