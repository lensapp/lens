/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { webFrame } from "electron";

const webFrameInjectable = getInjectable({
  id: "web-frame",
  instantiate: () => webFrame,
  lifecycle: lifecycleEnum.singleton,
  causesSideEffects: true,
});

export default webFrameInjectable;
