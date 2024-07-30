import { PropType } from "vue"
import { FDConfigData, FDThemeConfig, FDHighLightType, FDPatternItem, FDControlItem, FDFormType } from "."

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
  },
  typePrefix: { // 自定义节点/边类型前缀,如snaker:task,snaker:transition，只是snaker:则为前辍
    type: String,
    default: 'snaker:'
  },
  viewer: { // 是否查看模式
    type: Boolean,
    default: false
  }
}