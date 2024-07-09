// Join.ts
import { ColorEnum, NodeStateEnum } from "../types/enums";
import { DiamondNode, DiamondNodeModel, h } from "@logicflow/core";
import joinSvgStr from '../assets/join.svg?raw'
import { parseSvg } from '../tool'
const paths = parseSvg(joinSvgStr)
class JoinModel extends DiamondNodeModel {
  setAttributes(): void {
    this.text.value = "";
    this.rx = 28;
    this.ry = 28;
    this.text.draggable = false;
    this.text.editable = false;
  }
  getNodeStyle() {
    const theme = this.graphModel.props.theme;
    const style = super.getNodeStyle();
    if(this.properties.state == NodeStateEnum.history) {
      style.stroke = theme.historyColor || ColorEnum.historyColor;
    } else if(this.properties.state == NodeStateEnum.active) {
      style.stroke = theme.activeColor || ColorEnum.activeColor;
    } else {
      style.stroke = theme.primaryColor || ColorEnum.primaryColor;
    }
    // style.strokeDasharray = "3 3";
    return style;
  }
}

class JoinView extends DiamondNode {
  private getLabelShape() {
    const { model } = this.props;
    const { x, y} = model;
    const style = model.getNodeStyle();
    const innerWH = 28;
    return h(
      "svg",
      {
        x: x - innerWH/2,
        y: y - innerWH/2,
        width: innerWH,
        height: innerWH,
        viewBox: "0 0 1024 1024"
      },
      ...paths.map(d=>{
        return h("path", {
          fill: style.stroke,
          d
        })
      }),
    );
  }

 /**
   * 完全自定义节点外观方法
   */
 getShape() {
  const outCircle = super.getShape();
  return h("g", {}, [
    outCircle,
    this.getLabelShape()
  ]);
}
}

export default {
  type: "join",
  view: JoinView,
  model: JoinModel,
};
