import { GraphConfigData } from "@logicflow/core";
import { de } from "element-plus/es/locales.mjs";
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
  componentProps?: any; // 表单组件属性
} 