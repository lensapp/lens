/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";
import { ClusterFrameHandler } from "./cluster-frame-handler";

const clusterFrameHandlerInjectable = getInjectable({
  instantiate: (di) => new ClusterFrameHandler({
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clusterFrameHandlerInjectable;
