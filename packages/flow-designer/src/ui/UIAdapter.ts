import { defineAsyncComponent } from 'vue';
import { getCurrentInstance } from 'vue';
class UIAdapter {
  uiLibrary: string;
  constructor() {
    const instance = getCurrentInstance()
    this.uiLibrary = instance?.appContext.config.globalProperties.$uiLibrary || 'antd';
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
  public isAntd = () => {
    return this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd';
  };
}
export default UIAdapter;