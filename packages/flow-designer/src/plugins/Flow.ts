
const nodes = import.meta.glob('../node/*.ts',{
  eager: true
})
const edges = import.meta.glob('../edge/*.ts',{
  eager: true
})
class Flow {
  static pluginName = 'flow'
  constructor(data: any){
    const lf = data.lf;
    // 注册../node/*.ts下的所有节点
    Object.keys(nodes).forEach((key) => {
      const node = (nodes[key] as any).default
      lf.register(node)
    })
    // 注册../edge/*.ts下的所有边
    Object.keys(edges).forEach((key) => {
      const edge = (edges[key] as any).default
      lf.register(edge)
    })
    lf.setDefaultEdgeType('custom-edge')
  }
  test(){
    
  }
}
export default Flow