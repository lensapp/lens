/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const requestAnimationFrameInjectable = getInjectable({
  id: "request-animation-frame",
  instantiate: () => (callback: () => void) => requestAnimationFrame(callback),
  causesSideEffects: true,
});

export default requestAnimationFrameInjectable;
