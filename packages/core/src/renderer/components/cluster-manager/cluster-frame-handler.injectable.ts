/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import getClusterByIdInjectable from "../../../features/cluster/storage/common/get-by-id.injectable";
import { ClusterFrameHandler } from "./cluster-frame-handler";
import emitClusterVisibilityInjectable from "./emit-cluster-visibility.injectable";

const clusterFrameHandlerInjectable = getInjectable({
  id: "cluster-frame-handler",
  instantiate: (di) => new ClusterFrameHandler({
    emitClusterVisibility: di.inject(emitClusterVisibilityInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    logger: di.inject(loggerInjectionToken),
  }),
});

export default clusterFrameHandlerInjectable;
