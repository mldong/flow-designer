import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import FlowDesigner from '../packages/index'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
createApp(App).use(Antd).use(FlowDesigner).mount('#app')
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// createApp(App).use(ElementPlus).use(FlowDesigner, {
//   uiLibrary: 'element-plus'
// }).mount('#app')
