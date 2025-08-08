import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pagesでのサブディレクトリ公開時はbaseをリポジトリ名に変更
export default defineConfig({
  plugins: [react()],
  base: '/wikipedia-map-app/', // ★必要に応じて変更
})
