
import LogicFlow from '@logicflow/core';
import { DndPanel } from '@logicflow/extension';
import StartSvg from './../assets/start.svg'
import UserTaskSvg from './../assets/user-task.svg'
import CustomSvg from './../assets/custom.svg'
import EndSvg from './../assets/end.svg'
import DecisionSvg from './../assets/decision.svg'
import ForkSvg from './../assets/fork.svg'
import JoinSvg from './../assets/join.svg'
import SubProcessSvg from './../assets/subProcess.svg'

LogicFlow.use(DndPanel)
const nodes = import.meta.glob('../node/*.ts',{
  eager: true
})
const edges = import.meta.glob('../edge/*.ts',{
  eager: true
})
class Flow {
  static pluginName = 'flow'
  static defaultEdgeType = 'custom-edge'
  static defaultDndPanel = [
    {
      type: 'start',
      text: '开始',
      label: '开始节点',
      icon: StartSvg
    },
    {
      type: 'task',
      label: '用户任务',
      text: '用户任务',
      icon: UserTaskSvg
    },
    {
      type: 'custom',
      label: '自定义任务',
      text: '自定义任务',
      icon: CustomSvg
    },
    {
      type: 'decision',
      label: '条件判断',
      text: '条件判断',
      icon: DecisionSvg
    },
    {
      type: 'fork',
      label: '分支',
      text: '分支',
      icon: ForkSvg
    },
    {
      type: 'join',
      label: '合并',
      text: '合并',
      icon: JoinSvg
    },
    {
      type: 'subProcess',
      label: '子流程',
      text: '子流程',
      icon: SubProcessSvg
    },
    {
      type: 'end',
      text: '结束',
      label: '结束节点',
      icon: EndSvg
    }
  ]
  lf: any;
  constructor(data: any){
    this.lf = data.lf;
    const props = data.props
    // 注册../node/*.ts下的所有节点
    Object.keys(nodes).forEach((key) => {
      const node = (nodes[key] as any).default
      this.lf.register(node)
    })
    // 注册../edge/*.ts下的所有边
    Object.keys(edges).forEach((key) => {
      const edge = (edges[key] as any).default
      this.lf.register(edge)
    })
    this.lf.setDefaultEdgeType(props.defaultEdgeType || Flow.defaultEdgeType)
    if(props.initDndPanel !== false) {
      if(props.dndPanel && props.dndPanel.length) {
        this.initDndPanel(props.dndPanel)
      } else {
        this.initDndPanel(Flow.defaultDndPanel)
      }
    }
    const lf = this.lf;
    lf.adapterIn = (userData: any) =>{
      console.log('adapterIn', userData)
      // 绑定name和displayName到graphModel
      lf.graphModel.name = userData.name
      lf.graphModel.displayName = userData.displayName
      return userData;
    }
    lf.adapterOut = (userData: any) =>{
      // console.log('adapterOut', userData)
      // 从graphModel取出name和displayName
      return {
        ...userData,
        name: lf.graphModel.name,
        displayName: lf.graphModel.displayName
      };
    }
    lf.graphModel.props = props;
  }
  initDndPanel(data: any){
    this.lf.extension.dndPanel.setPatternItems(data)
  }
}
export default Flow