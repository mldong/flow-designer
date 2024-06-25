import { HtmlResize } from "@logicflow/extension";
import { createApp } from "vue";
import VueNode from './VueNode.vue'
class CustomVueModel extends HtmlResize.model {
  setAttributes(): void {
    this.text.editable = false
  }
}
class CustomVueView extends HtmlResize.view {
  shouldUpdate(): boolean {
    const data = {
      ...this.props.model.getProperties(),
      isSelected: this.props.model.isSelected,
      isHovered: this.props.model.isHovered,
      // id: this.props.model.id,
      // __textValue__: this.props.model.text.value
    }
    if (this.preProperties && this.preProperties === JSON.stringify(data)) return false
    this.preProperties = JSON.stringify(data)
    return true
  }
  setHtml(rootEl: HTMLElement) {
    rootEl.innerHTML = '';
    const el: HTMLElement = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    if(this.props.model.isHovered) {
      el.style.background = 'yellow'
    } else {
      el.style.background = 'red'
    }
    const app = createApp(VueNode, {
      model: this.props.model,
      isHovered: this.props.model.isHovered,
      isSelected: this.props.model.isSelected
    })
    app.mount(el)
    rootEl.appendChild(el)
  }
  getText(): ''{
    return ''
  }
}
export default {
  type: "custom-vue",
  view: CustomVueView,
  model: CustomVueModel
}