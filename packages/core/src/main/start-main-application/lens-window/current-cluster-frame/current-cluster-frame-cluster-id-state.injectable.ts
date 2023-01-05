/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ClusterId } from "../../../../common/cluster-types";

const currentClusterFrameClusterIdStateInjectable = getInjectable({
  id: "current-cluster-frame-cluster-id-state",

  instantiate: () => observable.box<ClusterId>(),
});

export default currentClusterFrameClusterIdStateInjectable;
