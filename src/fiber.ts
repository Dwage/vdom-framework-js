import { Hook } from "./hooks";
import { Props, VNode, VNodeTypes } from "./vdom";

export const fiberState: {
  currentFiber: Fiber | null;
  workInProgressRoot: Fiber | null;
  currentRoot: Fiber | null;
  nextUnitOfWork: Fiber | null;
  isRendering: boolean;
  pendingEffects: Fiber[];
  deletions: Fiber[];
  scheduledCallback: number | null;
} = {
  currentFiber: null,
  workInProgressRoot: null,
  currentRoot: null,
  nextUnitOfWork: null,
  isRendering: false,
  pendingEffects: [],
  deletions: [],
  scheduledCallback: null,
};

export interface Fiber {
  type: VNodeTypes | null;

  stateNode: HTMLElement | Text | null;

  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;

  alternate: Fiber | null;
  pendingProps: Props;
  memoizedProps: Props;

  vnode: VNode | null;

  key: string | number | null;

  hooks: Hook[] | null;
  hookIndex: number;

  isComponent: boolean;
  dirty: boolean;
}

export function createFiber(
  type: VNodeTypes | null,
  key: string | number | null = null,
): Fiber {
  return {
    type,
    stateNode: null,
    return: null,
    child: null,
    sibling: null,
    alternate: null,
    pendingProps: {},
    memoizedProps: {},
    vnode: null,
    key: key,
    hooks: null,
    hookIndex: 0,
    isComponent: typeof type === "function",
    dirty: false,
  };
}

export function createWorkInProgress(fiber: Fiber): Fiber {
  const workInProgress: Fiber =
    fiber.alternate || createFiber(fiber.type, fiber.key);

  workInProgress.type = fiber.type;
  workInProgress.stateNode = fiber.stateNode;
  workInProgress.alternate = fiber;
  workInProgress.vnode = fiber.vnode;
  workInProgress.pendingProps = fiber.pendingProps;
  workInProgress.key = fiber.key;
  workInProgress.hooks = fiber.hooks;
  workInProgress.isComponent = fiber.isComponent;
  workInProgress.child = null;
  workInProgress.sibling = null;

  return workInProgress;
}
