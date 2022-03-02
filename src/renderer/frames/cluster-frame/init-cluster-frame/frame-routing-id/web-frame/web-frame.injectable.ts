/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { webFrame } from "electron";

const webFrameInjectable = getInjectable({
  id: "web-frame",
  instantiate: () => webFrame,
  causesSideEffects: true,
});

export default webFrameInjectable;
