/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const doAnimationInAnimateComponentInjectable = getInjectable({
  id: "do-animation-in-animate-component",
  instantiate: () => true,
  causesSideEffects: true,
});

export default doAnimationInAnimateComponentInjectable;
