import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { createVDom } from "./create-element";
import { DOM, FC, HuyuElement, VDom, VNode } from "./type";

export const render = (huyuElement: HuyuElement, ownerDom: DOM | null) => {
  let vDom = createVDom(huyuElement);
  let dom = createDom(vDom, ownerDom);
  updateDom(dom, vDom.props);
  return dom;
};

const createDom = (vDom: VDom, ownerDom: DOM) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createDom(d, ownerDom));
  }

  let element: HTMLElement | Text | SVGSVGElement;

  if (vDom.type === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vDom as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (vDom.type === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", vDom.type);
  } else {
    element = document.createElement(vDom.type as string);
  }

  (vDom.props.children || []).forEach((child) => createDom(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};

const updateDom = (dom: DOM, props) => {
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
    } else if (key.startsWith("on")) {
      updateDomEvent(dom, key, value);
    } else if (key === "style") {
      updateDomStyle(dom, value);
    } else {
      if (key === "key" || key === "ref") {
        continue;
      }
      updateDomAttribute(dom, key, value);
    }
  }
};

const updateDomStyle = (dom: DOM, style) => {
  for (const [key, value] of Object.entries(style)) {
    dom["style"][key] = value;
  }
};

const updateDomEvent = (dom: DOM, eventName: string, event) => {
  dom.addEventListener(eventName.toLowerCase().substring(2), event);
};

const updateDomAttribute = (dom: DOM, key, value) => {
  (dom as SVGSVGElement | HTMLElement).setAttribute(key, value);
};

// const isEvent = (key: string) => key.startsWith("on");
// const isStyle = (key: string) => {
//   return key === "style" && !isEvent(key);
// };
// const isProperty = (key:string) => {
//   return key !== "children" && !isEvent(key) && !isStyle(key)
// }
