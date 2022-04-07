export type Key = string | number;

export type MutableRefObject<T> = {
  current: T;
};

// Question: Why we need this?
// export type RefCallback<T> = {
//   bivarianceHack(instance: T | null): void
// }['bivarianceHack']

export type Ref<T = any> = MutableRefObject<T> | null;

export interface Attributes extends Record<string, any> {
  key?: Key;
  children?: HuyuNode;
  ref?: Ref;
}

export type HuyuText = string | number;

export interface HuyuElement<P extends Attributes = any, T = string> {
  type: T;
  props: P;
  key: string;
}

export type HuyuNode =
  | HuyuText
  | HuyuElement
  | HuyuNode[]
  | boolean
  | null
  | undefined;

export interface FC<P extends Attributes = {}> {
  (props: P): HuyuElement<P> | null;
  fiber?: IFiber;
  tag?: number;
  type?: string;
}

export type HTMLElementEx = HTMLElement & { last: IFiber | null };

export interface IFiber<P extends Attributes = any> {
  key?: string;
  type: string | FC<P>;
  parentNode: HTMLElementEx;
  childNodes: any;
  node: HTMLElementEx;
  kids?: any;
  return?: IFiber<P>;
  sibling?: IFiber<P>;
  child?: IFiber<P>;
  done?: () => void;
  // ref: IRef;
  // hooks: IHook;
  // oldProps: P;
  // after: any;
  // props: P;
  // lane: number;
  // time: number;
  // e: IFiber;
  // prev: IFiber;
  // d: IFiber;
  // laziness: any[];
  // dirty: boolean;
  // isComp: boolean;
  // walker: any;
}
