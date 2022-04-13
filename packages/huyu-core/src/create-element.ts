import { ComponentChildren, FC, Ref, VNode } from "./type";
import { TEXT_ELEMENT } from "./constant";

export const createRef = (): Ref<null> => {
  return { current: null };
};

export const createElement = (
  type: string | object | FC<any>,
  props: Record<string, any> | null | undefined,
  ...children: ComponentChildren
) => {
  let key = props.key || null;
  let ref = props.ref || null;

  if (key) props.key = undefined;
  if (ref) props.ref = undefined;

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

export const createTextElement = (
  value: string | number | bigint | boolean
) => {
  return createElement(TEXT_ELEMENT, { nodeValue: value.toString() });
};

export const Fragment = (props) => {
  return props.children;
};
