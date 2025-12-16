import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages - set to repo name (e.g., '/svdp_tickets_webapp/')
  // For custom domain or root deployment, set to '/'
  base: process.env.GITHUB_ACTIONS ? '/svdp_tickets_webapp/' : '/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    basicSsl(), // Enable HTTPS for camera access on mobile
  ],
  server: {
    host: true, // Expose to local network
  },
})
