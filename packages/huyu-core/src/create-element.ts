import { ComponentChildren, Ref, VNode } from "./type";
import { TEXT_ELEMENT } from "./constant";

export const createRef = (): Ref<null> => {
  return { current: null };
};

export const createElement = (
  type: string,
  props: Record<string, any> | null | undefined,
  ...children: ComponentChildren
) => {
  let normalizedProps: VNode["props"] = {
    children: [],
  };
  let key: string | undefined = undefined;
  let ref: Ref<any> | undefined = undefined;

  for (const i in props) {
    if (i === "key") {
      key = props[i];
    } else if (i === "ref") {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }

  // What happened if we have children as [] instead of undefined or null?
  // preact - children.length > 3 ? slice.call(arguments, 2) : children;
  // @link https://github.com/preactjs/preact/blob/c18db4d89dad77c1a728e5323720397986d198b8/src/create-element.js#L27

  if (children.length > 0) {
    normalizedProps["children"] = children.map((c) =>
      c instanceof Object ? c : createTextElement(c)
    );
  }

  const vNode: VNode = {
    type,
    props: normalizedProps,
    key,
    ref,
  };

  return vNode;
};

export const createTextElement = (
  value: string | number | bigint | boolean
) => {
  return createElement(TEXT_ELEMENT, { nodeValue: value.toString() });
};
