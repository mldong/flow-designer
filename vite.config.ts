import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),{
    name: 'svg-transform',
    transform(code, id) {
      if (id.endsWith('.svg')) {
        const base64Str = fs.readFileSync(id, 'base64')
        return {
          code: `export default 'data:image/svg+xml;base64,${base64Str}'`,
          map: null,
        }
      }
    },
  }],
})
