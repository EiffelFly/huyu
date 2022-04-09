import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { VNode } from "./type";

export const render = (vNode: VNode, ownerDom: Element | null) => {
  let dom: Text | Element;
  let nodeType = vNode.type;
  if (nodeType === TEXT_ELEMENT) {
    dom = document.createTextNode("");
  } else if (nodeType === SVG_ELEMENT) {
    dom = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
  } else {
    dom = document.createElement(nodeType);
  }

  if (!ownerDom) {
    return dom;
  } else {
    return ownerDom.appendChild(dom);
  }
};
