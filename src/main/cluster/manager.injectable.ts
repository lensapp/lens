/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../common/cluster/store.injectable";
import { ClusterManager } from "./manager";
import clusterManagerLoggerInjectable from "./manager-logger.injectable";

const clusterManagerInjectable = getInjectable({
  id: "cluster-manager",
  instantiate: (di) => new ClusterManager({
    clusterStore: di.inject(clusterStoreInjectable),
    logger: di.inject(clusterManagerLoggerInjectable),
  }),
});

export default clusterManagerInjectable;
