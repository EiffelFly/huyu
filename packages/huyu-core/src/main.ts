/**
 * JSX related type
 */

import { TEXT_ELEMENT } from "./constant";

type Props<P = {}> = P & { children: Array<Jsx> };
type type = object | string | Component;
type Jsx = { type: type; props: Props };
type CompoundJsx = Array<Jsx> | Jsx;
type Component = (props: any) => CompoundJsx;

/**
 * JSX Syntax will call this function to construct a JSX object
 */

export const createJsx = (
  type: type,
  props: Partial<Props> & Record<string, any>,
  ...children: Array<Jsx>
): Jsx => {
  let kids =
    children.length > 0
      ? children.map((child) =>
          child instanceof Object ? child : createTextJsx(child)
        )
      : [];

  const jsxProps: Props = { ...props, children: kids };

  return {
    type,
    props: jsxProps,
  };
};

/**
 * Replace text in JSX with text node
 */

export const createTextJsx = (value: string | number | bigint | boolean) => {
  return createJsx(TEXT_ELEMENT, { nodeValue: value.toString() });
};

/**
 * JSX Fragment is the component that return children
 */

export const jsxFragment = (props: Props): CompoundJsx => {
  return props.children;
};
