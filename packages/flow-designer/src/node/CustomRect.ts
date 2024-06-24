// CustomRect.ts
import { RectResize } from "@logicflow/extension";

class CustomRectModel extends RectResize.model {
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "blue";
    style.strokeDasharray = "3 3";
    return style;
  }
}

class CustomRectView extends RectResize.view {}

export default {
  type: "custom-rect",
  view: CustomRectView,
  model: CustomRectModel,
};
