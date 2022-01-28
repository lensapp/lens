/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";

export type AddWindowEventListener = <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => Disposer;

const addWindowEventListener: AddWindowEventListener = (type, listener, options) => {
  window.addEventListener(type, listener, options);

  return () => window.removeEventListener(type, listener);
};
const addWindowEventListenerInjectable = getInjectable({
  instantiate: () => addWindowEventListener,
  lifecycle: lifecycleEnum.singleton,
});

export default addWindowEventListenerInjectable;
