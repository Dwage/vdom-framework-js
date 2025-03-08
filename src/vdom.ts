export interface Props {
    [key: string]: any;
  }
  
  export type VNodeTypes = string | FunctionComponent; 
  export type ChildVNode = VNode | string | number | null; 
  export type ChildrenVNode = Array<ChildVNode>;
  
  export interface VNode {
    type: VNodeTypes;
    props: Props;
    children: ChildrenVNode;
  }
  
  export type FunctionComponent<P = {}> = (props: P) => VNode | null;