import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { createVNode } from "./create-element";
import { FC, HuyuElement, VDom, VNode } from "./type";

export const render = (
  huyuElement: HuyuElement,
  ownerDom: Element | null | Text
) => {
  let vNode = createVNode(huyuElement);
  return createDOM(vNode, ownerDom);
};

export const createDOM = (vDom: VDom, ownerDom: Element | null | Text) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createDOM(d, ownerDom));
  }
  let element: Text | Element;

  if (vDom.type === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vDom as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (vDom.type === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", vDom.type);
  } else {
    element = document.createElement(vDom.type as string);
  }

  (vDom.props.children || []).forEach((child) => render(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};
