/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterFrameHandler } from "./lens-views";

const clusterFramesInjectable = getInjectable({
  id: "cluster-frames",
  instantiate: () => new ClusterFrameHandler(),
});

export default clusterFramesInjectable;
