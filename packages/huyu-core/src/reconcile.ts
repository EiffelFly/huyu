import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { VNode } from "./type";

export const render = (vNode: VNode, ownerDom: Element | null | Text) => {
  let element: Text | Element;
  let nodeType = vNode.type;

  if (nodeType === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vNode as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (nodeType === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
  } else {
    element = document.createElement(nodeType);
  }

  // This is not how the react work, in practice we should setting attributes with setAttribute
  // and using a synthetic event system to connect the events in the DOM with events in the VDOM.
  // https://itnext.io/creating-our-own-react-from-scratch-82dd6356676d

  // for (const attributes in vNode.props || {}) {
  //   element[attributes] = vNode.props[attributes];
  // }

  // recursive append children element
  (vNode.props.children || []).forEach((child) => render(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};
