export type Key = string | number | any;

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;

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
  ref?: Ref<any> | null; 
}

export type DOM = HTMLElement | Text | SVGSVGElement;

export type HuyuInstance = {
  /** Current instance's dom */
  dom: HTMLElement;

  /** Current instance's vDom */
  vDom: VDom;

  childrenInstance: HuyuInstance[];
};
