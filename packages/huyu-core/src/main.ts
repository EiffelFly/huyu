/**
 * JSX related type
 */
const TEXT_ELEMENT = "text";

type JsxProps<P = {}> = P & { children: Array<Jsx> };
type type = Jsx | string | Component;
type Jsx = { type: type; props: JsxProps };
type CompoundJsx = Array<Jsx> | Jsx;
type Component = (props: any) => CompoundJsx;

/**
 * JSX Syntax will call this function to construct a JSX object
 */

export const createJsx = (
  type: type,
  props: Partial<JsxProps> & Record<string, any>,
  ...children: Array<Jsx>
): Jsx => {
  let kids =
    children.length > 0
      ? children.map((child) =>
          child instanceof Object ? child : createTextJsx(child)
        )
      : [];

  const jsxProps: JsxProps = { ...props, children: kids };

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

export const jsxFragment = (props: JsxProps): CompoundJsx => {
  return props.children;
};

/**
 * Create VDom - recursively
 */

type VNodeProps<P = {}> = P & { children: Array<VNode> };
type VNode<P = {}> = {
  type: string;
  props: VNodeProps<P>;
};
type VDom = VNode | VNode[];

export const createVDom = (jsx: CompoundJsx): VDom => {
  if (Array.isArray(jsx)) {
    return jsx.map(createVDom).flat();
  }

  if (typeof jsx.type === "string") {
    let vNode: VNode;
    vNode.type = jsx.type;

    if (jsx.props.children.length > 0) {
      vNode.props = {
        ...jsx.props,
        children: jsx.props.children.map(createVDom).flat(),
      };
    } else {
      vNode.props = {
        ...jsx.props,
        children: [],
      };
    }

    return vNode;
  }

  if (typeof jsx.type === "function") {
    return createVDom(jsx.type(jsx.props));
  }

  if (typeof jsx.type === "object") {
    return createVDom(jsx.type);
  }
};