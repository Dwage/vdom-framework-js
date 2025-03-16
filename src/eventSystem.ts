import { Fiber } from "./fiber";

export type SyntheticEvent = {
  nativeEvent: Event;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  isPropagationStopped: boolean;
  defaultPrevented: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export const setupEventSystem = (rootContainer: HTMLElement): void => {
  const supportedEvents: string[] = [
    "click",
    "input",
    "change",
    "submit",
    "keydown",
    "keyup",
    "keypress",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseover",
    "mouseout",
  ];

  supportedEvents.forEach((eventType) => {
    rootContainer.addEventListener(eventType, handleEvent, false);
  });
};

function handleEvent(nativeEvent: Event): void {
  const eventType = nativeEvent.type;

  let target = nativeEvent.target as HTMLElement | null;
  const syntheticEvent = createSyntheticEvent(nativeEvent);

  const path: HTMLElement[] = [];
  while (target) {
    path.push(target);
    target = target.parentNode as HTMLElement | null;
  }

  for (let i = 0; i < path.length; i++) {
    const domNode = path[i];

    const fiber = getFiberFromDOM(domNode);

    if (fiber) {
      const handlerName = `on${eventType[0].toUpperCase()}${eventType.slice(1)}`;
      const handler = fiber.memoizedProps[handlerName] as
        | ((e: SyntheticEvent) => void)
        | undefined;

      if (handler) {
        handler(syntheticEvent);

        if (syntheticEvent.isPropagationStopped) {
          break;
        }
      }
    }
  }
}

function createSyntheticEvent(nativeEvent: Event): SyntheticEvent {
  const syntheticEvent: SyntheticEvent = {
    nativeEvent,
    target: nativeEvent.target,
    currentTarget: nativeEvent.currentTarget,
    preventDefault() {
      this.defaultPrevented = true;
      nativeEvent.preventDefault();
    },
    stopPropagation() {
      this.isPropagationStopped = true;
      nativeEvent.stopPropagation();
    },
    isPropagationStopped: false,
    defaultPrevented: false,
  };

  return syntheticEvent;
}

declare global {
  interface HTMLElement {
    _fiberNode?: Fiber;
  }

  interface Text {
    _fiberNode?: Fiber;
  }
}

function getFiberFromDOM(domNode: HTMLElement | Text): Fiber | null {
  return domNode._fiberNode || null;
}
