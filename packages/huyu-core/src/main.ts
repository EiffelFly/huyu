/**
 * Some constant
 */
const SVG_ELEMENT = "#svg";
const FRAGMENT_ELEMENT = "#fragment";

/**
 * JSX related type
 */

type JsxPrimitive = number | string;
type JsxNode = JsxPrimitive | Jsx;
type JsxProps<P = {}> = P & { children: Array<Jsx> };
type Tag = Jsx | string | Component;
type Jsx = { tag: Tag; props: JsxProps };
type Component = (props: any) => JsxNode;

/**
 * JSX Syntax will call this function to construct a JSX object
 */

export const createJsx = (
  tag: Tag,
  props: Partial<JsxProps> & Record<string, any>,
  ...children: Array<Jsx>
): Jsx => {
  const jsxProps: JsxProps = { ...props, children };

  return {
    tag,
    props: jsxProps,
  };
};

/**
 * JSX Fragment is a special jsx that return tag=#fragment
 */

export const jsxFragment = (props: JsxProps): Jsx => {
  return {
    tag: FRAGMENT_ELEMENT,
    props: { children: props.children },
  };
};

/**
 * Create VDom - recursively
 */

type DomPrimitive = string;
type VNodeProps<P = {}> = P & { children: Array<VNode> };
type VNode<P = {}> = {
  tag: string;
  props: VNodeProps<P>;
} & Record<string, any>;
type VDom = VNode | DomPrimitive;