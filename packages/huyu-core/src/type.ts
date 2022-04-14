export type Key = string | number | any;

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;

// When to use this definition?
// export type RefCallback<T> = {
//   bivarianceHack(instance: T | null): void
// }['bivarianceHack']

export type Ref<T> = RefObject<T> | RefCallback<T>;

export type ComponentChild =
  | VNode<any>
  | string
  | number
  | boolean
  | null
  | undefined;

export type ComponentChildren = ComponentChild[];

export interface FC<P = {}> {
  (props: P): VNode<any> | null;
  type: string;
}

export interface HuyuElement<P = {}> {
  type: string | HuyuElement | Function;
  props: P & { children: HuyuElement[] };
  key: Key;
  ref?: Ref<any> | null;
}

export type VDom = VNode | VNode[];

export interface VNode<P = {}> {
  /**
   * We use string to simplify the code, later on this may change to specific componentType like
   * preact or simple Function component type like fre
   */
  type: string | FC<P>;
  props: P & { children: VNode[] };
  key: Key;
  /**
   * ref is not guaranteed by React.ReactElement, for compatibility reasons
   * with popular react libs we define it as optional too
   * - from preact @link https://github.com/preactjs/preact/blob/master/src/internal.d.ts
   */
  ref?: Ref<any> | null;
  /**
   * The time this `vnode` started rendering. Will only be set when
   * the devtools are attached.
   * Default value: `0`
   * - from preact @link https://github.com/preactjs/preact/blob/master/src/internal.d.ts
   */
  startTime?: number;
  /**
   * The time that the rendering of this `vnode` was completed. Will only be
   * set when the devtools are attached.
   * Default value: `-1`
   * - from preact @link https://github.com/preactjs/preact/blob/master/src/internal.d.ts
   */
  endTime?: number;
}

export type DOM = HTMLElement | Text | SVGSVGElement;