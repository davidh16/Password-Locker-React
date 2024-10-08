import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode })=>{

  const env = loadEnv(mode, process.cwd(), '')

  return{

  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5713,
    proxy: {
      '/api': {
        target: "http://backend:8080",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5713,
  },
  define: {
    'process.env': env,
  }
}})

