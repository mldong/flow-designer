// Start.ts
import { ColorEnum, NodeStateEnum } from "../types/enums";
import { CircleNode, CircleNodeModel } from "@logicflow/core";
class StartModel extends CircleNodeModel {
  setAttributes(): void {
    this.r = 24;
    if((this.text && this.text.value == "") || !this.text) {
      this.text.value = "开始";
    }
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

class StartView extends CircleNode {
 
}

export default {
  type: "start",
  view: StartView,
  model: StartModel,
};
