import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { FC, VNode } from "./type";

export const render = (vNode: VNode, ownerDom: Element | null | Text) => {
  let element: Text | Element;
  let wip: VNode;

  if (typeof vNode.type === "function") {
    console.log("hi i am function component");

    wip = vNode.type(vNode.props);

  } else if (typeof vNode.type === "object") {
    console.log("hi i am named component");
    wip = vNode.type;
  } else {
    wip = vNode;
  }

  let wipType = wip.type as string;

  if (wipType === TEXT_ELEMENT) {
    element = document.createTextNode(
      (wip as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (wipType === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", wipType);
  } else {
    element = document.createElement(wipType);
  }

  // This is not how the react work, in practice we should setting attributes with setAttribute
  // and using a synthetic event system to connect the events in the DOM with events in the VDOM.
  // https://itnext.io/creating-our-own-react-from-scratch-82dd6356676d

  // for (const attributes in vNode.props || {}) {
  //   element[attributes] = vNode.props[attributes];
  // }

  // recursive append children element
  (wip.props.children || []).forEach((child) => render(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};
