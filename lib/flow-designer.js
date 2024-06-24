import { defineComponent as t, ref as r, openBlock as l, createElementBlock as s, toDisplayString as c } from "vue";
const i = /* @__PURE__ */ t({
  __name: "index",
  setup(e) {
    const o = r("flow-designer");
    return (a, p) => (l(), s("div", null, c(o.value), 1));
  }
}), n = i;
n.install = function(e) {
  e.component("FlowDesigner", n);
};
export {
  n as default
};
