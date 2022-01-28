/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";

export type AddElementEventListener = (
  <EventName extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: EventName,
    listener: (this: HTMLElement, event: HTMLElementEventMap[EventName]) => any,
    options?: boolean | AddEventListenerOptions,
  ) => Disposer
);

const addElementEventListener: AddElementEventListener = (element, type, listener, options) => {
  element.addEventListener(type, listener, options);

  return () => element.removeEventListener(type, listener);
};

const addElementEventListenerInjectable = getInjectable({
  instantiate: () => addElementEventListener,
  lifecycle: lifecycleEnum.singleton,
});

export default addElementEventListenerInjectable;
