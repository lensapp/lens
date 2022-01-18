/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";

function addWindowEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): Disposer {
  window.addEventListener(type, listener, options);

  return () => void window.removeEventListener(type, listener);
}

const windowAddEventListenerInjectable = getInjectable({
  instantiate: () => addWindowEventListener,
  lifecycle: lifecycleEnum.singleton,
});

export default windowAddEventListenerInjectable;
