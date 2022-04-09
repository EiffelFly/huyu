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
  | object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;

export interface VNode<P = {}> {
  type: string;
  props: P & { children: ComponentChildren };
  key: Key;
  /**
   * ref is not guaranteed by React.ReactElement, for compatibility reasons
   * with popular react libs we define it as optional too
   * - from preact
   */
  ref?: Ref<any> | null;
  /**
   * The time this `vnode` started rendering. Will only be set when
   * the devtools are attached.
   * Default value: `0`
   * - from preact
   */
  startTime?: number;
  /**
   * The time that the rendering of this `vnode` was completed. Will only be
   * set when the devtools are attached.
   * Default value: `-1`
   * - from preact
   */
  endTime?: number;
}
