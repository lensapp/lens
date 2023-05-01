/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { ReplicationControllerStore } from "./replication-controller-store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import replicationControllerApiInjectable from "../../../common/k8s-api/endpoints/replication-controller.api.injectable";

const replicationControllerStoreInjectable = getKubeStoreInjectable({
  id: "replication-controller-store",
  instantiate: (di) => {
    const api = di.inject(replicationControllerApiInjectable);

    return new ReplicationControllerStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default replicationControllerStoreInjectable;
