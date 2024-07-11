import { defineAsyncComponent } from 'vue';

class UIAdapter {
  uiLibrary: string;
  constructor(uiLibrary: string) {
    this.uiLibrary = uiLibrary;
  }
  /**
   * 创建按钮
   * @returns 
   */
  public createButton = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/button').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/button/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  };
}
export default UIAdapter;