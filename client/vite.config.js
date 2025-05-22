import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/static/', // 👈 Esto le dice a Vite que todo será servido desde /static/
  plugins: [react()],
})
