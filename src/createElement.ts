import { VNode, VNodeTypes, Props, ChildrenVNode, ChildVNode } from './vdom';

export function createElement(
  type: VNodeTypes,
  props: Props | null,
  ...children: ChildVNode[]
): VNode {
  return {
    type,
    props: props || {}, 
    children: children.flat().filter(child => child != null) as ChildrenVNode 
  };
}