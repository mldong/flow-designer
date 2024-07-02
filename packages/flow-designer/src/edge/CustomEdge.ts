import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";
import { ColorEnum, NodeStateEnum } from "../types/enums";

class CustomEdgeModel extends PolylineEdgeModel {

  getEdgeStyle() {
    const style = super.getEdgeStyle();
    if(this.properties.state == NodeStateEnum.history) {
      style.stroke = ColorEnum.historyColor;
    } else if(this.properties.state == NodeStateEnum.active) {
      style.stroke = ColorEnum.activeColor;
    } else {
      style.stroke = ColorEnum.edgePrimaryColor;
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