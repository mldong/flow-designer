// SubProcess.ts
import { h } from "@logicflow/core";
import { RectResize } from "@logicflow/extension";
import subProcessSvgStr from '../assets/subProcess.svg?raw'
import { parseSvg } from '../tool'
import { ColorEnum, NodeStateEnum } from "../types/enums";
const paths = parseSvg(subProcessSvgStr)
class SubProcessModel extends RectResize.model {
  setAttributes(): void {
    if((this.text && this.text.value == "") || !this.text) {
      this.text.value = "子流程";
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

class SubProcessView extends RectResize.view {
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
  type: "subProcess",
  view: SubProcessView,
  model: SubProcessModel,
};
