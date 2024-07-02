import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";
import { ColorEnum, NodeStateEnum } from "../types/enums";

class CustomEdgeModel extends PolylineEdgeModel {

  getEdgeStyle() {
    const theme = this.graphModel.props.theme;
    const style = super.getEdgeStyle();
    if(this.properties.state == NodeStateEnum.history) {
      style.stroke = theme.historyColor || ColorEnum.historyColor;
    } else if(this.properties.state == NodeStateEnum.active) {
      style.stroke = theme.activeColor || ColorEnum.activeColor;
    } else {
      style.stroke = theme.edgePrimaryColor || ColorEnum.edgePrimaryColor;
    }
    return style;
  }
}
class CustomEdge extends PolylineEdge {

}
export default {
  type: "custom-edge",
  view: CustomEdge,
  model: CustomEdgeModel
}