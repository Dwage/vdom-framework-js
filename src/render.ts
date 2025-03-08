import { VNode, VNodeTypes, Props, FunctionComponent } from './vdom';

export function render(vNode: VNode | null, container: HTMLElement | null): void {
  if (!container || vNode === null) {
    return; 
  }

  if (typeof vNode === 'string' || typeof vNode === 'number') {
    container.appendChild(document.createTextNode(String(vNode)));
    return;
  }

  if (typeof vNode.type === 'function') {
    const component = vNode.type as FunctionComponent<Props>;
    const componentVNode = component(vNode.props); 
    render(componentVNode, container); 
    return;
  }

  const element = document.createElement(vNode.type as string);

  if (vNode.props) {
    Object.keys(vNode.props).forEach(key => {
      if (key.startsWith('on') && typeof vNode.props[key] === 'function') {
        const eventName = key.substring(2).toLowerCase(); 
        element.addEventListener(eventName, vNode.props[key]);
      } else if (key === 'style' && typeof vNode.props[key] === 'object') {
        Object.assign(element.style, vNode.props[key]);
      }
      else if (key !== 'children') { 
        element.setAttribute(key, String(vNode.props[key]));
      }
    });
  }

  vNode.children.forEach(childVNode => {
    if (childVNode != null) {
        render(childVNode as VNode, element);
    }
  });

  container.appendChild(element);
}