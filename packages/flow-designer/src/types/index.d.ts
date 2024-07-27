import { GraphConfigData } from "@logicflow/core";
import { de } from "element-plus/es/locales.mjs";
import { VNode, PropType } from "vue";
/**
 * 流程设计器配置数据
 */
export declare type FDConfigData = {
  name?: string; // 唯一编码-流程名称
  displayName?: string; // 流程显示名称
  type?: string; // 流程类型
  instanceUrl?: string; // 启动实例要填写的表单key
  expireTime?: string; // 期待完成时间变量key
  instanceNoClass?: string; // xx.DefaultNoGenerator	实例编号生成器实现类
} & GraphConfigData
/**
 * 主题颜色配置
 */
export declare type FDThemeConfig = {
  primaryColor?: string; // 主题色
  edgePrimaryColor?: string; // 边主题色
  activeColor?: string; // 进行时节点颜色
  historyColor?: string; // 历史节点/边颜色
  backgroundColor ?: string;// 画布背景颜色
}
/**
 * 高亮数据类型
 */
export declare type FDHighLightType = {
  historyNodeNames?: Array<string>; // 历史节点名称
  historyEdgeNames?: Array<string>; // 历史边名称
  activeNodeNames?: Array<string>; // 活跃节点名称
}
/**
 * 拖拽面板数据类型
 */
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
/**
 * 控制面板数据类型
 */
export declare type FDControlItem = {
  key?: string; // 唯一编码
  iconClass?: string; // 图标类
  title?: string; // 标题
  text?: string; // 文本
  onClick?: Function // 事件函数
  hide?: boolean; // 是否隐藏
  sort?: number; // 排序字段
}
/**
 * 组件属性
 */
export const  MldongFlowDesignerProps = {
  value: {
    type: Object as PropType<FDConfigData>,
    default() {
      return {}
    }
  },
  theme: { // 高亮主题配置
    type: Object as PropType<FDThemeConfig>,
    default() {
      return {
        
      }
    }
  },
  highLight: { // 高亮数据
    type: Object as PropType<FDHighLightType>,
      default() {
      return {
        
      }
    }
  },
  initDndPanel: { // 是否初始化拖拽面板
    type: Boolean,
    default: true
  },
  dndPanel: { // 拖拽面板
    type: Array as PropType<Array<FDPatternItem>>,
  },
  initControl: { // 是否初始化控制面板
    type: Boolean,
    default: true
  },
  control: { // 控制面板
    type: Array as PropType<Array<FDControlItem>>,
  },
  nodeClick: { // 节点点击事件
    type: Function,
  },
  edgeClick: { // 边点击事件
    type: Function,
  },
  drawerWidth: { // 抽屉宽度
    type: [String,Number] as PropType<string | number>,
    default: '600px'
  },
  modalWidth: { // 弹窗宽度
    type: [String,Number] as PropType<string | number>,
    default: '60%'
  },
  processForm: { // 流程表单配置
    type: Object as PropType<FDFormType>
  },
  edgeForm: { // 边表单配置
    type: Object as PropType<FDFormType>
  }
}