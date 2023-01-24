/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type RequestIdleCallback = (callback: () => void, options: { timeout: number }) => number;

const requestIdleCallbackInjectable = getInjectable({
  id: "request-idle-callback",
  instantiate: (): RequestIdleCallback => window.requestIdleCallback,
  causesSideEffects: true,
});

export default requestIdleCallbackInjectable;
