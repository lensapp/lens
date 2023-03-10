/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "@k8slens/utilities";

export type AddWindowEventListener = typeof addWindowEventListener;
export type WindowEventListener<K extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[K]) => any;

function addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: WindowEventListener<K>, options?: boolean | AddEventListenerOptions): Disposer {
  window.addEventListener(type, listener, options);

  return () => void window.removeEventListener(type, listener);
}

const windowAddEventListenerInjectable = getInjectable({
  id: "window-add-event-listener",
  instantiate: () => addWindowEventListener,
});

export default windowAddEventListenerInjectable;
