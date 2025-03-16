import { fiberState, Fiber } from "./fiber";
import { Props, ChildrenVNode, VNode, FunctionComponent } from "./vdom";

interface DOMElement extends HTMLElement {
  _fiberNode?: Fiber;
}

interface DOMText extends Text {
  _fiberNode?: Fiber;
}

type DOMNode = DOMElement | DOMText;

export function performUnitOfWork(fiber: Fiber): Fiber | null {
  if (fiber.isComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }

  return null;
}

function updateFunctionComponent(fiber: Fiber) {
  fiberState.currentFiber = fiber;
  fiber.hookIndex = 0;

  const Component = fiber.type as FunctionComponent;
  const props = fiber.pendingProps;
  const children = [Component(props)].filter(Boolean);

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.stateNode) {
    fiber.stateNode = createDOMNode(fiber);
  } else {
    updateExistingNode(fiber);
  }

  reconcileChildren(fiber, fiber.vnode?.props.children || []);
}

function updateExistingNode(fiber: Fiber): void {
  if (isTextNode(fiber.stateNode)) {
    updateTextNode(fiber);
  } else if (fiber.stateNode instanceof HTMLElement) {
    updateDOMProperties(
      fiber.stateNode as DOMElement,
      fiber.alternate?.memoizedProps || {},
      fiber.pendingProps,
    );
  }
}

function updateTextNode(fiber: Fiber): void {
  const textNode = fiber.stateNode as DOMText;
  const newValue = fiber.vnode?.props?.nodeValue ?? "";

  if (textNode.nodeValue !== newValue) {
    console.log(`[DOM] Text element updated of parent: ${fiber.return?.type}`);
    textNode.nodeValue = newValue;
  }
}

function createDOMNode(fiber: Fiber): DOMNode {
  console.log(`[DOM] CREATE: ${fiber.type || "[Text]"}`);

  if (isTextContent(fiber)) {
    return document.createTextNode(
      fiber.vnode?.props?.nodeValue ?? String(fiber.vnode),
    ) as DOMText;
  }

  if (typeof fiber.type === "string") {
    const element = document.createElement(fiber.type) as DOMElement;
    updateDOMProperties(element, {}, fiber.pendingProps);
    return element;
  }

  return document.createComment("Empty node") as unknown as DOMNode;
}

function updateDOMProperties(
  element: DOMElement,
  oldProps: Props,
  newProps: Props,
): void {
  let hasUpdates = false;

  hasUpdates = removeOldProps(element, oldProps, newProps) || hasUpdates;

  hasUpdates = updateNewProps(element, oldProps, newProps) || hasUpdates;

  if (hasUpdates) {
    console.log(`[DOM] Element updated: ${element.tagName}`);
  }

  if (fiberState.currentFiber) {
    element._fiberNode = fiberState.currentFiber;
  }
}

function removeOldProps(
  element: DOMElement,
  oldProps: Props,
  newProps: Props,
): boolean {
  let hasUpdates = false;

  Object.keys(oldProps).forEach((propName) => {
    if (propName === "children") return;

    if (!(propName in newProps)) {
      console.log(`[DOM] Remove prop: ${propName}`);

      if (propName === "className") {
        element.removeAttribute("class");
      } else if (propName === "style") {
        element.style.cssText = "";
      } else if (!propName.startsWith("on")) {
        element.removeAttribute(propName);
      }

      hasUpdates = true;
    }
  });

  return hasUpdates;
}

function updateNewProps(
  element: DOMElement,
  oldProps: Props,
  newProps: Props,
): boolean {
  let hasUpdates = false;

  Object.entries(newProps).forEach(([propName, newValue]) => {
    if (propName === "children") return;
    if (propName.startsWith("on")) return;

    const oldValue = oldProps[propName];

    if (propName === "style") {
      if (!isStyleChanged(oldValue, newValue)) return;
    } else if (Object.is(oldValue, newValue)) {
      return;
    }

    console.log(`[DOM] Update prop: ${propName}`, {
      old: oldValue,
      new: newValue,
    });

    if (propName === "className") {
      element.className = newValue || "";
    } else if (propName === "style") {
      updateStyleProperty(element, oldValue, newValue);
    } else {
      element.setAttribute(propName, newValue);
    }

    hasUpdates = true;
  });

  return hasUpdates;
}

function updateStyleProperty(
  element: DOMElement,
  oldStyle: any,
  newStyle: any,
): void {
  Object.keys({ ...oldStyle, ...newStyle }).forEach((key) => {
    if (oldStyle?.[key] !== newStyle?.[key]) {
      element.style[key as any] = newStyle?.[key] || "";
    }
  });
}

function isTextContent(fiber: Fiber): boolean {
  return (
    typeof fiber.vnode === "string" ||
    typeof fiber.vnode === "number" ||
    (fiber.vnode?.props?.nodeValue !== undefined && !fiber.type)
  );
}

function isTextNode(node: any): node is DOMText {
  return node instanceof Text;
}

function isStyleChanged(oldStyle: any, newStyle: any): boolean {
  if ((!oldStyle && newStyle) || (oldStyle && !newStyle)) {
    return true;
  }

  if (!oldStyle && !newStyle) {
    return false;
  }

  const allKeys = new Set([...Object.keys(oldStyle), ...Object.keys(newStyle)]);

  for (const key of allKeys) {
    if (oldStyle[key] !== newStyle[key]) {
      return true;
    }
  }

  return false;
}

function reconcileChildren(fiber: Fiber, children: ChildrenVNode) {
  let oldFiber = fiber.alternate?.child || null;
  let prevSibling: Fiber | null = null;
  let index = 0;

  const normalizedChildren = normalizeChildren(children);

  while (index < normalizedChildren.length || oldFiber) {
    const child = normalizedChildren[index];
    let newFiber: Fiber | null = null;

    const sameType = isSameType(oldFiber, child);

    if (sameType && oldFiber) {
      newFiber = createUpdatedFiber(oldFiber, child, fiber);
    } else if (child && (!oldFiber || !sameType)) {
      newFiber = createNewFiber(child, fiber);
    } else if (oldFiber && !sameType) {
      markForDeletion(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (newFiber) {
      attachFiberToTree(newFiber, fiber, index, prevSibling);
      prevSibling = newFiber;
    }

    index++;
  }
}

function normalizeChildren(children: ChildrenVNode): VNode[] {
  return children.map((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return {
        type: "",
        props: { children: [], nodeValue: child },
        key: null,
      } as VNode;
    }
    return child as VNode;
  });
}

function isSameType(oldFiber: Fiber | null, child: VNode | undefined): boolean {
  return !!(
    oldFiber &&
    child &&
    ((child.type === null && oldFiber.type === null) ||
      (child.type === oldFiber.type && child.key === oldFiber.key))
  );
}

function createUpdatedFiber(
  oldFiber: Fiber,
  child: VNode,
  parentFiber: Fiber,
): Fiber {
  return {
    ...oldFiber,
    stateNode: oldFiber.stateNode,
    pendingProps: typeof child === "object" ? child.props : {},
    vnode: typeof child === "object" ? child : null,
    return: parentFiber,
    alternate: oldFiber,
    dirty: false,
  };
}

function createNewFiber(child: VNode, parentFiber: Fiber): Fiber {
  return {
    type: typeof child === "object" ? child.type : null,
    stateNode: null,
    return: parentFiber,
    child: null,
    sibling: null,
    alternate: null,
    pendingProps: typeof child === "object" ? child.props : {},
    memoizedProps: {},
    vnode: typeof child === "object" ? child : child,
    key: typeof child === "object" ? (child.key ?? null) : null,
    hooks: null,
    hookIndex: 0,
    isComponent:
      typeof (typeof child === "object" ? child.type : null) === "function",
    dirty: false,
  };
}

function markForDeletion(fiber: Fiber): void {
  fiber.dirty = true;
  fiberState.deletions.push(fiber);
}

function attachFiberToTree(
  newFiber: Fiber,
  parentFiber: Fiber,
  index: number,
  prevSibling: Fiber | null,
): void {
  if (index === 0) {
    parentFiber.child = newFiber;
  } else if (prevSibling) {
    prevSibling.sibling = newFiber;
  }
}

export function commitRoot() {
  fiberState.deletions.forEach(commitWork);

  if (fiberState.workInProgressRoot?.child) {
    commitWork(fiberState.workInProgressRoot.child);
  }

  fiberState.pendingEffects.forEach(commitEffects);
  fiberState.pendingEffects = [];

  console.log("====== Current Fiber Tree ======");
  logFiberTree(fiberState.currentRoot);
  console.log("================================");

  fiberState.currentRoot = fiberState.workInProgressRoot;
  fiberState.workInProgressRoot = null;
  fiberState.deletions = [];
  fiberState.isRendering = false;
}

function commitWork(fiber: Fiber): void {
  if (!fiber) return;

  if (fiber.isComponent) {
    commitWork(fiber.child!);
    commitWork(fiber.sibling!);
    return;
  }

  const parentNode = findParentDOMNode(fiber);

  if (fiber.dirty) {
    removeDOMNode(fiber, parentNode);
  } else if (fiber.stateNode) {
    updateDOMNode(fiber, parentNode);
  }

  fiber.memoizedProps = fiber.pendingProps;
  fiber.dirty = false;

  commitWork(fiber.child!);
  commitWork(fiber.sibling!);
}

function findParentDOMNode(fiber: Fiber): DOMElement | null {
  let parentFiber = fiber.return;

  while (parentFiber && !parentFiber.stateNode && parentFiber.isComponent) {
    parentFiber = parentFiber.return;
  }

  return (parentFiber?.stateNode as DOMElement) || null;
}

function removeDOMNode(fiber: Fiber, parentNode: DOMElement | null): void {
  if (fiber.stateNode && parentNode && parentNode.contains(fiber.stateNode)) {
    console.log(`[DOM] REMOVE: ${fiber.type || "[Text]"}`);
    parentNode.removeChild(fiber.stateNode);

    if (isDOMNodeWithFiber(fiber.stateNode)) {
      delete fiber.stateNode._fiberNode;
    }
  }
}

function updateDOMNode(fiber: Fiber, parentNode: DOMElement | null): void {
  if (!parentNode) return;

  if (!parentNode.contains(fiber.stateNode)) {
    parentNode.appendChild(fiber.stateNode as Node);
  }

  if (isTextNode(fiber.stateNode) && fiber.vnode) {
    const newText = String(fiber.vnode.props?.nodeValue || "");
    if (fiber.stateNode.nodeValue !== newText) {
      fiber.stateNode.nodeValue = newText;
    }
  }

  if (isDOMNodeWithFiber(fiber.stateNode)) {
    fiber.stateNode._fiberNode = fiber;
  }
}

function isDOMNodeWithFiber(node: any): node is DOMNode {
  return node instanceof HTMLElement || node instanceof Text;
}

function commitEffects(fiber: Fiber) {
  if (!fiber.hooks) return;

  fiber.hooks.forEach((hook) => {
    if (hook.type === "effect" && hook.shouldRun) {
      if (hook.cleanup) {
        hook.cleanup();
      }

      const cleanup = hook.value();
      if (typeof cleanup === "function") {
        hook.cleanup = cleanup;
      }

      hook.shouldRun = false;
    }
  });
}

function logFiberTree(fiber: Fiber | null, depth: number = 0) {
  if (!fiber) return;

  const indent = "  ".repeat(depth);
  const type = getDisplayName(fiber);

  console.log(`${indent}${type}`, {
    key: fiber.key,
    stateNode: fiber.stateNode?.constructor.name,
    hooks: fiber.hooks?.map((h) => h.type),
    isComponent: fiber.isComponent,
    dirty: fiber.dirty,
  });

  if (fiber.child) logFiberTree(fiber.child, depth + 1);
  if (fiber.sibling) logFiberTree(fiber.sibling, depth);
}

function getDisplayName(fiber: Fiber): string {
  return fiber.type === null
    ? "[Text]"
    : typeof fiber.type === "function"
      ? fiber.type.name || "AnonymousComponent"
      : fiber.type;
}
