/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { ReplicationControllerStore } from "./replication-controller-store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import replicationControllerApiInjectable from "../../../common/k8s-api/endpoints/replication-controller.api.injectable";

const replicationControllerStoreInjectable = getInjectable({
  id: "replication-controller-store",
  instantiate: (di) => {
    const api = di.inject(replicationControllerApiInjectable);

    return new ReplicationControllerStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default replicationControllerStoreInjectable;
