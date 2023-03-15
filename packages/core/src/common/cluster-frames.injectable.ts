/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface ClusterFrameInfo {
  frameId: number;
  processId: number;
}

const clusterFramesInjectable = getInjectable({
  id: "cluster-frames",
  instantiate: () => observable.map<string, ClusterFrameInfo>(),
});

export default clusterFramesInjectable;
