import { HtmlResize } from "@logicflow/extension";
import { createApp, h } from "vue";
import VueNode from './VueNode.vue'
class CustomVueModel extends HtmlResize.model {
  setAttributes(): void {
    this.text.editable = false
  }
}
class CustomVueView extends HtmlResize.view {
  app: any;
  vnode: any;
  isMounted: boolean = false;
  constructor(props: any) {
    super(props)
    this.vnode = h(VueNode, {
      model: props.model,
      isHovered: props.model.isHovered,
      isSelected: props.model.isSelected
    });
    // const _this = this;
    // this.app = createApp({
    //   render() {
    //     return _this.vnode
    //   }
    // })
    this.app = createApp({
      render: () => this.vnode
    })
  }
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
    if(!this.isMounted) {
      rootEl.innerHTML = '';
      const el: HTMLElement = document.createElement('div');
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.background = 'red';
      rootEl.appendChild(el)
      this.app.mount(el)
      this.isMounted = true;
    } else {
      // 更新组件数据
      this.vnode.component.props.isHovered = this.props.model.isHovered
      this.vnode.component.props.isSelected = this.props.model.isSelected
      this.vnode.component.props.model = {
        // ...this.props.model,
        isHovered: this.props.model.isHovered,
        isSelected: this.props.model.isSelected,
        graphModel: this.props.model.graphModel,
        data: {
          id: this.props.model.id,
          type: this.props.model.type,
          x: this.props.model.x,
          y: this.props.model.y,
          text: this.props.model.text,
          properties: this.props.model.properties
        }
      }
    }
    
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