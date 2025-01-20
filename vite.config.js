import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/relation-web-2.0/',  // 设置基础路径
  plugins: [react()],
});
