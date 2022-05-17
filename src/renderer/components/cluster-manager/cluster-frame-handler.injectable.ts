/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterFrameHandler } from "./cluster-frame-handler";

const clusterFrameHandlerInjectable = getInjectable({
  id: "cluster-frame-handler",
  instantiate: () => new ClusterFrameHandler(),
});

export default clusterFrameHandlerInjectable;
