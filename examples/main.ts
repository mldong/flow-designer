import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
createApp(App).use(Antd).mount('#app')
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// const app = createApp(App)
// app.config.globalProperties.$uiLibrary= 'element-plus'
// app.use(ElementPlus).mount('#app')
// createApp(App).use(ElementPlus).use(FlowDesigner, {
//   uiLibrary: 'element-plus'
// }).mount('#app')
