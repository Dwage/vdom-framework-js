import { VNode, VNodeTypes, Props, ChildrenVNode, ChildVNode } from "./vdom";

export function createElement(
  type: VNodeTypes,
  props: Props | null = null,
  ...children: ChildVNode[]
): VNode {
  const newProps = {
    ...props,
    children: children.flat().filter((child) => child != null) as ChildrenVNode,
  };

  return {
    type,
    props: newProps,
    key: props?.key || null,
  };
}
