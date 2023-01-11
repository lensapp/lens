/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterFrameMap } from "./cluster-frames";

const clusterFramesInjectable = getInjectable({
  id: "cluster-frames",
  instantiate: () => clusterFrameMap,
  causesSideEffects: true,
});

export default clusterFramesInjectable;
