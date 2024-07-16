import { FDFormType } from "../types";

/**
 * 开始节点表单元数据
 * 
 */
export const start:FDFormType = {
  labelWidth: '200px',
  formItems: [{
    name: "name",
    label: "唯一编码",
    component: 'Input',
    componentProps: {
      placeholder: '请输入唯一编码'
    }
  }, {
    name: "displayName",
    label: "显示名称",
    component: 'Input',
    componentProps: {
      placeholder: '请输入显示名称'
    }
  }, {
    name: "preInterceptors",
    label: "前置拦截器",
    component: 'Input',
    componentProps: {
      placeholder: '请输入前置拦截器'
    }
  }, {
    name: "postInterceptors",
    label: "后置拦截器",
    component: 'Input',
    componentProps: {
      placeholder: '请输入后置拦截器'
    }
  }]
}

/**
 * 开始节点表单元数据
 * 
 */
export const end:FDFormType = {
  labelWidth: '200px',
  formItems: [{
    name: "name",
    label: "唯一编码",
    component: 'Input',
    componentProps: {
      placeholder: '请输入唯一编码'
    }
  }, {
    name: "displayName",
    label: "显示名称",
    component: 'Input',
    componentProps: {
      placeholder: '请输入显示名称'
    }
  }, {
    name: "preInterceptors",
    label: "前置拦截器",
    component: 'Input',
    componentProps: {
      placeholder: '请输入前置拦截器'
    }
  }, {
    name: "postInterceptors",
    label: "后置拦截器",
    component: 'Input',
    componentProps: {
      placeholder: '请输入后置拦截器'
    }
  }]
}