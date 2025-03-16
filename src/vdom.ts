import { Fiber } from "./fiber";

export type VNodeTypes = string | FunctionComponent;
export type ChildVNode = VNode | string | number | null;
export type ChildrenVNode = Array<ChildVNode>;
export type Props = { [key: string]: any; key?: string | number | null };
export type FunctionComponent<P = {}> = (props: P) => VNode | null;

export interface VNode {
  type: VNodeTypes;
  props: Props & { children?: ChildrenVNode };
  key?: string | number | null;
  _owner?: Fiber;
}
