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
    return element;
  }

  if (Array.isArray(element)) {
    return element.map(createVDom)
  }

  if (element.type instanceof Function) {
    return createVDom(element.type(element.props));
  }

  if (element.type instanceof Object) {
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
