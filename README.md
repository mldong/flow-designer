# mldong-flow-designer-plus
本项目包含了作者为B站课堂视频[《工作流设计器开发最佳实践》](https://www.bilibili.com/cheese/play/ss24484)的过程源码。教程中开发的组件也可用于实际生产环境中。以下是和使用文档和课程章节说明。
## 使用文档
### 兼容性注意
* 因Vite 需要 Node.js 版本 18+ 或 20+。当你的包管理器发出警告时，请注意升级你的 Node 版本。
* 本项目是在 Node.js 版本 16+的环境下测试通过。
### 下载
```shell
git clone https://gitee.com/mldong/flow-designer.git
```
### 安装
```shell
yarn add mldong-flow-designer-plus --registry=https://registry.npmmirror.com
# 或者
npm install mldong-flow-designer-plus --registry=https://registry.npmmirror.com 
```
### 全局注册
```javascript
import { createApp } from 'vue'
import FlowDesigner from 'mldong-flow-designer-plus'
import 'mldong-flow-designer-plus/lib/style.css'
const app = createApp(App)
// 注：uiLibrary和当前项目使用的UI库保持一致
// 如果为局部注册，则需要指定uiLibrary
// app.config.globalProperties.$uiLibrary= 'element-plus'

app.use(FlowDesigner,{
  // 指定UI库：antd | element-plus
  uiLibrary: 'element-plus'
})
```
### 使用样例
#### 编辑模式
```html
<template>
  <MldongFlowDesignerPlus v-model:value="graphData" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
const graphData = ref({
    name: 'leave1',
    displayName: '请假流程',
    postInterceptors: "leave_postInterceptors",
    nodes: [
      {
        id: "1",
        type: "snaker:start",
        x: 100,
        y: 100,
        properties: {
          // state: 'history'
          postInterceptors: "start_postInterceptors"
        }
      },
      {
        id: "2",
        type: "snaker:task",
        x: 300,
        y: 200,
        text: "节点2",
        properties: {
          // state: 'active'
          form: 'leaveForm',
          postInterceptors: "task_postInterceptors"
        }
      },
      {
        id: "3",
        type: "snaker:end",
        x: 500,
        y: 600,
        text: "结束",
        properties: {
          postInterceptors: "end_postInterceptors"
        }
      },
    ],
    edges: [
      {
        id: "1-2",
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "snaker:transition",
        text: "连线",
        properties: {
          // state: 'history'
          expr: "${a} == 1"
        }
      },
      {
        id: "2-3",
        sourceNodeId: "2",
        targetNodeId: "3",
        type: "snaker:transition",
        text: "连线2",
        properties: {
          // state: 'history'
          expr: "${a} == 2"
        }
      },
    ],
  })
</script>
```
#### 只读模式
```html
<template>
  <MldongFlowDesignerPlus :viewer="true" v-model:value="graphData" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
const graphData = ref({
    name: 'leave1',
    displayName: '请假流程',
    postInterceptors: "leave_postInterceptors",
    nodes: [
      {
        id: "1",
        type: "snaker:start",
        x: 100,
        y: 100,
        properties: {
          // state: 'history'
          postInterceptors: "start_postInterceptors"
        }
      },
      {
        id: "2",
        type: "snaker:task",
        x: 300,
        y: 200,
        text: "节点2",
        properties: {
          // state: 'active'
          form: 'leaveForm',
          postInterceptors: "task_postInterceptors"
        }
      },
      {
        id: "3",
        type: "snaker:end",
        x: 500,
        y: 600,
        text: "结束",
        properties: {
          postInterceptors: "end_postInterceptors"
        }
      },
    ],
    edges: [
      {
        id: "1-2",
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "snaker:transition",
        text: "连线",
        properties: {
          // state: 'history'
          expr: "${a} == 1"
        }
      },
      {
        id: "2-3",
        sourceNodeId: "2",
        targetNodeId: "3",
        type: "snaker:transition",
        text: "连线2",
        properties: {
          // state: 'history'
          expr: "${a} == 2"
        }
      },
    ],
  })
</script>
```
### 属性说明
| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| v-model:value | object | - | 流程图数据 |
| theme | FDThemeConfig | - | 主题配置 | 
| highLight | FDHighLightType | 高亮配置 |
| initDndPanel | boolean | true | 是否初始化拖拽面板 | 
| dndPanel | FDPatternItem | - | 拖拽面板配置 |
| initControl | boolean | true | 是否初始化控制面板 | 
| control | FDControlItem | - | 控制面板配置 |
| nodeClick | Function | - | 节点点击事件 |
| edgeClick | Function | - | 边点击事件 |
| drawerWidth | String | Number | 600px | 抽屉宽度 |
| modalWidth | String | Number | 60% | 弹窗宽度 |
| processForm | FDFormType | - | 流程表单配置 |
| edgeForm | FDFormType | - | 边表单配置 |
| defaultEdgeType | string | snaker:transition | 默认边 |
| typePrefix | string | snaker: | 自定义节点/边类型前缀 |
| viewer | boolean | false | 是否查看模式 |
#### FDThemeConfig
```typescript
export declare type FDThemeConfig = {
  primaryColor?: string; // 主题色
  edgePrimaryColor?: string; // 边主题色
  activeColor?: string; // 进行时节点颜色
  historyColor?: string; // 历史节点/边颜色
  backgroundColor ?: string;// 画布背景颜色
}
```
#### FDHighLightType
```typescript
export declare type FDHighLightType = {
  historyNodeNames?: Array<string>; // 历史节点名称
  historyEdgeNames?: Array<string>; // 历史边名称
  activeNodeNames?: Array<string>; // 活跃节点名称
}
```
#### FDPatternItem
```typescript
export declare type FDPatternItem = {
  type?: string;
  text?: string;
  label?: string;
  icon?: string;
  className?: string;
  properties?: object;
  callback?: () => void;
  hide?: boolean; // 是否隐藏
  sort?: number; // 排序字段
  drawerTitle?: string;// 抽屉标题
  nodeClick?: (e: any) => void;
  form?: FDFormType; // 表单配置
};
```
#### FDControlItem
```typescript
export declare type FDControlItem = {
  key?: string; // 唯一编码
  iconClass?: string; // 图标类
  title?: string; // 标题
  text?: string; // 文本
  onClick?: Function // 事件函数
  hide?: boolean; // 是否隐藏
  sort?: number; // 排序字段
}
```
#### FDFormType和FDFormItemType
```typescript
/**
 * 表单数据类型
 */
export declare type FDFormType = {
  labelWidth?: string;
  formItems: Array<FDFormItemType>;
} 
/**
 * 表单项数据类型
 */
export declare type FDFormItemType = {
  name: string; // 表单项名称
  label?: string; // 表单项标签
  component?: 'Input' | 'Select'; // 表单组件
  render?: (args: any) => VNode;
  componentProps?: any; // 表单组件属性
} 
```
### 事件
| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| on-init | 初始化事件 | (lf: any) => void |
| on-render | 渲染事件 | (lf: any) => void |
| on-save | 控制面板保存事件 | (graphData: any) => void |

## 课程章节
* 第一章·基础篇
   - 搭建Vue3脚手架工程
   - 改造成Vue3组件库目录结构
   - 集成LogicFlow
   - 自定义节点初探
   - 自定义svg节点
   - 自定义html节点
   - 自定义vue节点
   - 自定义vue节点优化
   - 自定义边
   - 主题配置
   - 拖拽面板
   - 控制面板
* 第二章·进阶篇
   - 事件监听
   - 自定义事件
   - 数据转换 Adapter
   - 自定义插件初探
   - 自定义插件属性配置
   - svg图标处理(一)
   - svg图标处理(二)
* 第三章·实现篇·组件初探
   - 流程设计器组件初步设计
   - 流程设计器数据双向绑定实现
   - 流程设计器配置数据类型定义
   - 流程设计器节点高亮实现
   - 流程设计器边高亮实现
   - 流程设计器高亮主题配置
   - 流程设计器设置高亮属性
   - 流程设计器高亮属性配置实现
* 第四章·实现篇·拖拽面板
   - 拖拽元素·开始节点
   - 拖拽元素·结束节点
   - 开始节点和结束节点边连接规则
   - 拖拽元素·自定义任务节点
   - 拖拽元素·条件判断节点
   - 拖拽元素·分支与合并节点
   - 拖拽元素·子流程节点
   - 拖拽面板组件配置项·初探
   - 拖拽面板组件配置项·属性覆盖及隐藏控制
   - 拖拽面板组件配置项·节点事件
   - 拖拽面板组件配置项·边事件
   - 初始化事件注册自定义节点
   - 拖拽元素排序
* 第五章·实现篇·UI适配
   - UI适配·初探
   - UI适配·Button组件(一)
   - UI适配·Button组件(二)
   - 增加UI适配器类
   - UI适配器优化
   - UI适配注意事项
   - UI适配·抽屉组件初探
   - UI适配·抽屉组件和节点边事件处理
   - UI适配·抽屉组件动态标题
   - UI适配·抽屉组件动态标题优化
   - UI适配·抽屉组件宽度配置
   - UI适配·antd表单
   - UI适配·element-plus表单
* 第六章·实现篇·元数据表单
   - 元数据表单·简单数据结构
   - 元数据表单·开始节点和结束节点
   - 元数据表单·用户任务节点(一)
   - 元数据表单·用户任务节点(二)
   - 元数据表单·labelWidth属性处理
   - 元数据表单·其它拖拽节点
   - 元数据表单·流程表单和自定义配置
   - 元数据表单·自定义渲染函数
   - 元数据表单·自定义函数之v-model
   - 元数据表单·自定义组件实现v-model
   - 元数据表单·边表单和自定义配置
* 第七章·实现篇·流程图数据
   - 流程图数据·节点和边表单赋值
   - 流程图数据·流程表单赋值
   - 流程图数据·表单数据变化监听处理初探
   - 流程图数据·表单数据变化监听处理优化
   - 流程图数据·流程表单数据变化监听处理
   - 流程图数据·修复上一步下一步bug
* 第八章·实现篇·控制面板
   - 控制面板·配置化初探
   - 控制面板·配置化实现
   - 控制面板·自定义图标
   - 控制面板·查看流程数据弹窗适配
   - 控制面板·查看流程数据
   - 控制面板·查看流程数据复制
   - 控制面板·导入流程数据弹窗
   - 控制面板·导入流程数据逻辑处理
   - 控制面板·设置高亮数据
   - 控制面板·导入和高亮UI适配
   - 控制面板·保存按钮逻辑处理
   - 控制面板·清空逻辑处理
* 第九章·打包部署篇
   - 打包发布篇·初探
   - 打包发布篇·云效流水线(一)
   - 打包发布篇·云效流水线(三)
   - 打包发布篇·依赖包安装测试
   - 打包发布篇·svg转base64处理
   - 打包发布篇·本地包调试
   - 打包发布篇·本地包调试错误修复
   - 打包发布篇·组件类型推导配置
   - 打包发布篇·组件类型推导之代码提示
   - 打包发布篇·组件定义类型导出
   - 打包发布篇·修复1.0.4版编译失败bug