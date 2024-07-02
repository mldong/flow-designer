// CustomRect.ts
import { h } from "@logicflow/core";
import { RectResize } from "@logicflow/extension";
import userTaskSvgStr from '../assets/user-task.svg?raw'
import { parseSvg } from '../tool'
import { ColorEnum, NodeStateEnum } from "../types/enums";
const paths = parseSvg(userTaskSvgStr)
class CustomRectModel extends RectResize.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    if(this.properties.state == NodeStateEnum.history) {
      style.stroke = ColorEnum.historyColor;
    } else if(this.properties.state == NodeStateEnum.active) {
      style.stroke = ColorEnum.activeColor;
    } else {
      style.stroke = ColorEnum.primaryColor;
    }
    style.strokeDasharray = "3 3";
    return style;
  }
}

class CustomRectView extends RectResize.view {
  private getLabelShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    return h(
      "svg",
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: "0 0 1274 1024"
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
  getResizeShape() {
    const { model } = this.props;
    const { x, y, width, height, radius } = model;
    const style = model.getNodeStyle();
    return h("g", {}, [
      h("rect", {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height
      }),
      this.getLabelShape()
    ]);
  }
}

export default {
  type: "custom-rect",
  view: CustomRectView,
  model: CustomRectModel,
};
