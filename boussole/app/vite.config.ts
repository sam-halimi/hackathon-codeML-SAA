import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { timelineApi } from './server/timelineApi.ts'

// GitHub Pages sert le site sous /hackathon-codeML-SAA/ ; en local, à la racine.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/hackathon-codeML-SAA/' : '/',
  plugins: [react(), tailwindcss(), timelineApi()],
})
