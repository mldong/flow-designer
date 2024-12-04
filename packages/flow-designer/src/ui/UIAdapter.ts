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
  /**
   * 创建抽屉
   * @returns 
   */
  public createDrawer = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/drawer').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/drawer/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  };
  /**
   * 创建表单
   */
  public createForm = () =>{
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/form').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/form/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  }
  /**
   * 创建表单
   */
  public createFormItem = () =>{
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/form/FormItem').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/form/index').then(mod => mod.default.FormItem));
    }
    throw new Error('Unsupported UI library');
  }
  /**
     * 创建Input
     */
  public createInput = () =>{
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/input').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/input/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  }
  /**
     * 创建Select
     */
  public createSelect = (): any => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/select').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/select/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  }
  /**
   * 创建Textarea
   * @returns 
   */
  public createTextarea = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/input').then(mod => mod.default.TextArea));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/input/index').then(mod => mod.default));
    }
  }
  /**
     * 创建Select
     */
  public createOption = (): any => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/select').then(mod => mod.default.Option));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/select/index').then(mod => mod.default.Option));
    }
    throw new Error('Unsupported UI library');
  }
  public isAntd = () => {
    return this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd';
  };
  /**
   * 创建Modal
   */
  public createModal = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/modal').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/dialog/index').then(mod=> mod.default));
    }
  }
  /**
   * 创建消息对象
   */
  public createMessage = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return import('ant-design-vue/es/message');
    } else if (this.uiLibrary === 'element-plus') {
      return import('element-plus/es/components/message/index');
    }
  }
  /**
   * 创建文字提示对象
   */
  public createTooltip = () => {
    if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
      return defineAsyncComponent(() => import('ant-design-vue/es/tooltip').then(mod => mod.default));
    } else if (this.uiLibrary === 'element-plus') {
      return defineAsyncComponent(() => import('element-plus/es/components/tooltip/index').then(mod=> mod.default));
    }
  }
}
export default UIAdapter;