import type { App, Plugin } from 'vue'
import LogicFlowCo from '@logicflow/core'
import * as LogicFlowC from '@logicflow/core'
import * as LogicFlowExt from '@logicflow/extension'
import FlowDesigner from './flow-designer/'
const MFlowDesigner: any = FlowDesigner
MFlowDesigner.install = function (app: App, options: any) {
  app.component('MldongFlowDesignerPlus', MFlowDesigner)
  if(options?.uiLibrary) {
    app.config.globalProperties.$uiLibrary= options.uiLibrary
  }
}
export default MFlowDesigner as typeof MFlowDesigner &
  Plugin

export const LogicFlow = LogicFlowCo
export const LogicFlowCore = LogicFlowC;
export const LogicFlowExtension = LogicFlowExt
