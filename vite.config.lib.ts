import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: './lib',
        lib: {
            entry: './packages/index.ts', // 根据实际情况调整入口文件
            name: 'FlowDesigner',
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['vue'], // 外部依赖，根据实际情况添加
        },
    }, 
})
