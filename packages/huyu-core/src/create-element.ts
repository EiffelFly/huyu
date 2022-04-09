import { ComponentChildren, Ref, VNode } from "./type";

export const createRef = (): Ref<null> => {
  return { current: null };
};

export const createElement = (
  type: string,
  props: object | null | undefined,
  children: ComponentChildren[]
) => {
  let normalizedProps: VNode["props"] = {
    children: [],
  };
  let key: string;
  let ref: Ref<any>;

  for (const i in props) {
    if (i === "key") {
      key = props[i];
    } else if (i === "ref") {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }

  // What happened if we have children as [] not undefined or null?
  // preact - children.length > 3 ? slice.call(arguments, 2) : children;
  // @link https://github.com/preactjs/preact/blob/c18db4d89dad77c1a728e5323720397986d198b8/src/create-element.js#L27

  if (children.length > 0) {
    normalizedProps["children"] = children;
  } else {
    normalizedProps["children"] = [];
  }

  const vNode: VNode = {
    type,
    props: normalizedProps,
    key,
    ref,
  };

  return vNode;
};
