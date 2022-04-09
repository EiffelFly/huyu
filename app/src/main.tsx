import { render } from "../../packages/huyu-core/src/reconcile";
import { createElement } from "../../packages/huyu-core/src/create-element";

const vNode = createElement("div", {}, []);
render(vNode, document.getElementById("root"))
