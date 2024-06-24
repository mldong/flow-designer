import type { App, Plugin } from 'vue'
import FlowDesigner from './flow-designer/'
const MFlowDesigner: any = FlowDesigner
MFlowDesigner.install = function (app: App) {
  app.component('FlowDesigner', MFlowDesigner)
}
export default MFlowDesigner as typeof MFlowDesigner &
  Plugin
