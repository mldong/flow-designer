import { GraphConfigData } from "@logicflow/core";
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