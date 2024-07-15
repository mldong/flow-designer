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
      return defineAsyncComponent(() => import('element-plus/es/components/form/index').then(mod => mod.default));
    }
    throw new Error('Unsupported UI library');
  }
/**
   * 创建表单
   */
public createInput = () =>{
  if (this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd') {
    return defineAsyncComponent(() => import('ant-design-vue/es/input').then(mod => mod.default));
  } else if (this.uiLibrary === 'element-plus') {
    return defineAsyncComponent(() => import('element-plus/es/components/input/index').then(mod => mod.default));
  }
  throw new Error('Unsupported UI library');
}
  public isAntd = () => {
    return this.uiLibrary === 'ant-design-vue' || this.uiLibrary === 'antd';
  };
}
export default UIAdapter;