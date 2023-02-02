/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rootComponentInjectionToken } from "../../bootstrap/tokens";
import { ClusterFrame } from "./cluster-frame";

const clusterFrameRootComponentInjectable = getInjectable({
  id: "cluster-frame-root-component",
  instantiate: () => ({
    Component: ClusterFrame,
    isActive: !process.isMainFrame,
  }),
  injectionToken: rootComponentInjectionToken,
});

export default clusterFrameRootComponentInjectable;
