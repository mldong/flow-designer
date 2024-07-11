import type { App, Plugin } from 'vue'
import FlowDesigner from './flow-designer/'
const MFlowDesigner: any = FlowDesigner
MFlowDesigner.install = function (app: App, options: any) {
  app.component('FlowDesigner', MFlowDesigner)
  if(options?.uiLibrary) {
    app.config.globalProperties.$uiLibrary= options.uiLibrary
  }
}
export default MFlowDesigner as typeof MFlowDesigner &
  Plugin
