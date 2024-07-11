import type { App, Plugin } from 'vue'
import FlowDesigner from './flow-designer/'
import UIAdapter from './flow-designer/src/ui/UIAdapter'
const MFlowDesigner: any = FlowDesigner
MFlowDesigner.install = function (app: App, options: any) {
  app.component('FlowDesigner', MFlowDesigner)
  if(options?.uiLibrary) {
    app.config.globalProperties.$uiLibrary= options.uiLibrary
    app.config.globalProperties.$uiAdapter = new UIAdapter(options.uiLibrary)
  } else {
    app.config.globalProperties.$uiAdapter = new UIAdapter('antd')
  }
}
export default MFlowDesigner as typeof MFlowDesigner &
  Plugin
