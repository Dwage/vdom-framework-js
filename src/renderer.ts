import { VNode } from "./vdom";
import { Fiber, fiberState, createFiber, createWorkInProgress } from "./fiber";
import { performUnitOfWork, commitRoot } from "./reconciler";
import { setupEventSystem } from "./eventSystem";

export function render(vnode: VNode, container: HTMLElement) {
  if (!fiberState.currentRoot) {
    const rootFiber = createFiber("ROOT");
    rootFiber.stateNode = container;
    fiberState.currentRoot = rootFiber;
    setupEventSystem(container);
  }

  fiberState.currentRoot.pendingProps = { children: [vnode] };
  fiberState.currentRoot.vnode = {
    type: "div", // Doesn't matter
    props: { children: [vnode] },
  };

  scheduleUpdate(fiberState.currentRoot);
}

function workLoop(deadline?: IdleDeadline) {
  let shouldYield = false;

  while (fiberState.nextUnitOfWork && !shouldYield) {
    fiberState.nextUnitOfWork = performUnitOfWork(fiberState.nextUnitOfWork);

    if (deadline && deadline.timeRemaining() < 1) {
      shouldYield = true;
    }
  }

  if (!fiberState.nextUnitOfWork && fiberState.workInProgressRoot) {
    commitRoot();
  } else if (fiberState.nextUnitOfWork) {
    requestIdleCallback(workLoop);
  }
}

export function scheduleUpdate(fiber: Fiber) {
  if (fiberState.isRendering) {
    return;
  }

  if (fiberState.scheduledCallback) {
    cancelIdleCallback(fiberState.scheduledCallback);
    fiberState.scheduledCallback = null;
  }

  fiber.dirty = true;

  let root = fiber;
  while (root.return) {
    root = root.return;
  }

  fiberState.isRendering = true;
  fiberState.workInProgressRoot = createWorkInProgress(root);
  fiberState.nextUnitOfWork = fiberState.workInProgressRoot;

  fiberState.scheduledCallback = requestIdleCallback(workLoop);
}

const requestIdleCallback =
  window.requestIdleCallback ||
  function (callback: IdleRequestCallback): number {
    const start = Date.now();
    return window.setTimeout(function () {
      callback({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };
