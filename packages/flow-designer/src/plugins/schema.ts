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
 * 结束节点表单元数据
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

/**
 * 用户任务表单元数据
 * 
 */

export const task:FDFormType = {
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
  }, {
    name: "form",
    label: "表单",
    component: 'Input',
    componentProps: {
      placeholder: '请输入表单'
    }
  }, 
  {
    name: "assignee",
    label: "参与人",
    component: 'Input',
    componentProps: {
      placeholder: '请输入参与人'
    }
  }, {
    name: "assignmentHandler",
    label: "参与人处理类",
    component: 'Input',
    componentProps: {
      placeholder: '请输入参与人处理类'
    }
  }, {
    name: "taskType",
    label: "任务类型",
    component: 'Select',
    componentProps: {
      placeholder: '请选择任务类型',
      options: [
        {
          label: '主办',
          value: 'Major'
        },
        {
          label: '协办',
          value: 'Aidant'
        }
      ]
    }
  }, {
    name: "performType",
    label: "参与类型",
    component: 'Select',
    componentProps: {
      placeholder: '请选择参与类型',
      options: [
        {
          label: '普通参与',
          value: 'ANY'
        },
        {
          label: '会签参与',
          value: 'ALL'
        }
      ]
    }
  }, {
    name: "reminderTime",
    label: "提醒时间",
    component: 'Input',
    componentProps: {
      placeholder: '请输入提醒时间'
    }
  }, {
    name: "reminderRepeat",
    label: "重复提醒间隔",
    component: 'Input',
    componentProps: {
      placeholder: '请输入重复提醒间隔'
    }
  }, {
    name: "expireTime",
    label: "期待完成时间",
    component: 'Input',
    componentProps: {
      placeholder: '请输入期待完成时间'
    }
  }, {
    name: "autoExecute",
    label: "是否自动完成",
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否自动完成',
      options: [
        {
          label: '是',
          value: 'Y'
        },
        {
          label: '否',
          value: 'N'
        }
      ]
    }
  }, {
    name: "callback",
    label: "回调处理",
    component: 'Input',
    componentProps: {
      placeholder: '请输入回调处理'
    }
  }]
}