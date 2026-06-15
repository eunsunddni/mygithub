import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // 🔥 db.json 파일이 바뀌어도 개발 서버가 새로고침을 하지 않도록 제외합니다.
      ignored: ['**/db.json'] 
    }
  }
})
