import type { DefineComponent, ExtractPropTypes } from "vue";
import { MldongFlowDesignerProps } from '../flow-designer/src/types/index.d.ts'
type mProps = Partial<ExtractPropTypes<typeof MldongFlowDesignerProps>>

declare module 'mldong-flow-designer-plus' {
  const _default: DefineComponent<mProps>
  export default _default
}