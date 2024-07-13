
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
import { FDPatternItem } from '../types';

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
  static defaultDndPanel: Array<FDPatternItem>= [
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
      // 如果type相等，则替换属性，否则就追加
      const newDndPanel: Array<FDPatternItem> = [...Flow.defaultDndPanel]
      if(props.dndPanel && props.dndPanel.length > 0) {
        props.dndPanel.forEach((item: FDPatternItem) => {
          const index = newDndPanel.findIndex((i) => i.type === item.type)
          if(index > -1) {
            if(item.hide === true) {
              // 隐藏，则删除
              newDndPanel.splice(index, 1)
            } else {
              // 覆盖属性
              newDndPanel[index] = {
                ...newDndPanel[index],
                ...item,
              }
            }

          } else {
            newDndPanel.push(item)
          }
        })
      }
      // 对newDndPanel进行排序，以sort属性正序排序
      newDndPanel.sort((a:FDPatternItem, b: FDPatternItem) => {
        return (a.sort === undefined ? 99: a.sort) - (b.sort === undefined ? 99: b.sort)
      })
      this.initDndPanel(newDndPanel)
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
    // 事件处理优先级：dndPanel.nodeClick>props.nodeClick>defaultNodeClick
    const { eventCenter } = lf.graphModel;
    // 节点事件
    eventCenter.on('node:click', (event: any) => {
      const shapeList = this.lf.extension.dndPanel.shapeList
      const index = shapeList.findIndex((item: FDPatternItem)=>item.type === event.data.type)
      let nodeClick = props.nodeClick
      if(index>=-1) {
        nodeClick = shapeList[index].nodeClick || props.nodeClick
      }
      if(nodeClick && typeof nodeClick === 'function') {
        nodeClick(event)
      } else {
        props.drawerRef.value?.show({
          ...event,
          patternItem: shapeList[index]
        })
      }
    })
    // 边事件
    eventCenter.on('edge:click', (event: any) => {
      let edgeClick = props.edgeClick
      if(edgeClick && typeof edgeClick === 'function') {
        edgeClick(event)
      } else {
        props.drawerRef.value?.show(event)
      }
    })
    // 画布事件
    eventCenter.on('blank:contextmenu', (event: any) =>{
      props.drawerRef.value?.show({
        ...event,
        data: {
          type: 'process'
        }
      })
    })
  }
  initDndPanel(data: any){
    this.lf.extension.dndPanel.setPatternItems(data)
  }
}
export default Flow