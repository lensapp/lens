/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type RequestAnimationFrame = (callback: () => void) => void;

export const requestAnimationFrameInjectable = getInjectable({
  id: "request-animation-frame",
  // NOTE: this cannot be simplified to just `=> requestAnimationFrame` else an Illegal Invocation error will be thrown
  instantiate: (): RequestAnimationFrame => (callback) => requestAnimationFrame(callback),
  causesSideEffects: true,
});
