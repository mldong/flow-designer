import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";
import { EdgeAnimation } from "@logicflow/core/types/constant/DefaultTheme";

class CustomEdgeModel extends PolylineEdgeModel {
  setAttributes(): void {
    this.style.stroke = "red";
    this.isAnimation = true;
  }
  getEdgeAnimationStyle(): EdgeAnimation {
    const style = super.getEdgeAnimationStyle();
    return {
      ...style,
      stroke: "blue"
    }
  }
}
class CustomEdge extends PolylineEdge {

}
export default {
  type: "custom-edge",
  view: CustomEdge,
  model: CustomEdgeModel
}