import { ComponentChildren, FC, HuyuElement, Ref, VNode } from "./type";
import { TEXT_ELEMENT } from "./constant";

export const createRef = (): Ref<null> => {
  return { current: null };
};

export const createElement = (
  type: string | object | FC<any>,
  props: Record<string, any> | null | undefined,
  ...children: ComponentChildren
) => {
  props = props || {};
  let key = props.key || null;
  let ref = props.ref || null;

  if (key) props.key = undefined;
  if (ref) props.ref = undefined;

  // We can flat children here, but for the purpose of this project, we leave nested list for
  // further usage.

  let kids =
    children.length > 0
      ? children.map((child) =>
          child instanceof Object ? child : createTextElement(child)
        )
      : [];

  return {
    type,
    key,
    ref,
    props: {
      ...props,
      children: kids,
    },
  };
};

export const createVDom = (element: HuyuElement) => {
  if (typeof element.type === "string") {
    // console.log("isStr", element);
    if (element.props.children.length > 0) {
      element.props.children = element.props.children.map(createVDom);
    }
    return element;
  }

  if (Array.isArray(element)) {
    // console.log("isArr", element);
    return element.map(createVDom).flat();
  }

  if (element.type instanceof Function) {
    // console.log("isFunc", element);
    return createVDom(element.type(element.props));
  }

  if (element.type instanceof Object) {
    // console.log("isObj", element);
    return createVDom(element.type);
  }
};

export const createTextElement = (
  value: string | number | bigint | boolean
) => {
  return createElement(TEXT_ELEMENT, { nodeValue: value.toString() });
};

export const Fragment = (props) => {
  return props.children;
};
