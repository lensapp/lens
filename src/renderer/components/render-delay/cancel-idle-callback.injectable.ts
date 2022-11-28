/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type CancelIdleCallback = (handle: number) => void;

const cancelIdleCallbackInjectable = getInjectable({
  id: "cancel-idle-callback",
  instantiate: (): CancelIdleCallback => window.cancelIdleCallback,
  causesSideEffects: true,
});

export default cancelIdleCallbackInjectable;
