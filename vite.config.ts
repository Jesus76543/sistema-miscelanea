import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rivera_bracho_jesusramiro_proyecto_final/sistema-miscelanea/dist/',
  plugins: [react()],
})
