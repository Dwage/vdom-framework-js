import { fiberState } from "./fiber";
import { scheduleUpdate } from "./renderer";

export type Hook = StateHook<any> | CallbackHook<any> | EffectHook;

interface StateHook<T> {
  type: "state";
  value: T;
  queue: Array<T | ((prevState: T) => T)>;
}

interface CallbackHook<T extends Function> {
  type: "callback";
  value: T;
  deps: any[];
}

interface EffectHook {
  type: "effect";
  value: () => (() => void) | void;
  deps?: any[];
  cleanup?: (() => void) | void;
  shouldRun: boolean;
}

function getCurrentFiber() {
  if (!fiberState.currentFiber) {
    throw new Error("Hook can only be called inside a component");
  }
  return fiberState.currentFiber;
}

function getOrCreateHook<T extends Hook>(
  fiber: any,
  hookIndex: number,
  initialHook: T,
): T {
  if (!fiber.hooks) {
    fiber.hooks = [];
  }

  if (!fiber.hooks[hookIndex]) {
    fiber.hooks[hookIndex] = initialHook;
  }

  return fiber.hooks[hookIndex] as T;
}

function areDepsEqual(newDeps?: any[], oldDeps?: any[]): boolean {
  if (!newDeps || !oldDeps) return false;
  if (newDeps.length !== oldDeps.length) return false;
  return newDeps.every((dep, i) => Object.is(dep, oldDeps[i]));
}

export function useState<T>(
  initialValue: T | (() => T),
): [T, (newValue: T | ((prevValue: T) => T)) => void] {
  const fiber = getCurrentFiber();
  const hookIndex = fiber.hookIndex++;

  const initialHookValue =
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;

  const hook = getOrCreateHook<StateHook<T>>(fiber, hookIndex, {
    type: "state",
    value: initialHookValue,
    queue: [],
  });

  if (hook.queue && hook.queue.length > 0) {
    hook.value = hook.queue.reduce<T>((value, updater) => {
      return typeof updater === "function"
        ? (updater as (prevState: T) => T)(value)
        : (updater as T);
    }, hook.value);
    hook.queue = [];
  }

  const setState = (action: T | ((prevState: T) => T)) => {
    const newValue =
      typeof action === "function" ? (action as Function)(hook.value) : action;

    if (Object.is(hook.value, newValue)) {
      return;
    }

    hook.queue.push(action);
    scheduleUpdate(fiber);
  };

  return [hook.value, setState];
}

export function useCallback<T extends Function>(
  callback: T,
  deps: any[] = [],
): T {
  const fiber = getCurrentFiber();
  const hookIndex = fiber.hookIndex++;

  const hook = getOrCreateHook<CallbackHook<T>>(fiber, hookIndex, {
    type: "callback",
    value: callback,
    deps,
  });

  const depsChanged = !areDepsEqual(deps, hook.deps);

  if (depsChanged) {
    hook.value = callback;
    hook.deps = deps;
  }

  return hook.value;
}

export function useEffect(effect: () => (() => void) | void, deps?: any[]) {
  const fiber = getCurrentFiber();
  const hookIndex = fiber.hookIndex++;

  const hook = getOrCreateHook<EffectHook>(fiber, hookIndex, {
    type: "effect",
    value: effect,
    deps,
    cleanup: undefined,
    shouldRun: true,
  });

  const depsChanged = !areDepsEqual(deps, hook.deps);

  if (depsChanged) {
    hook.value = effect;
    hook.deps = deps;
    hook.shouldRun = true;

    if (!fiberState.pendingEffects.includes(fiber)) {
      fiberState.pendingEffects.push(fiber);
    }
  } else {
    hook.shouldRun = false;
  }
}
