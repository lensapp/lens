/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import ingressClassApiInjectable from "../../../common/k8s-api/endpoints/ingress-class.api.injectable";
import { IngressClassStore } from "./ingress-class-store";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const ingressClassStoreInjectable = getKubeStoreInjectable({
  id: "ingress-class-store",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "ingressClassStore is only available in certain environments");

    const api = di.inject(ingressClassApiInjectable);

    return new IngressClassStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default ingressClassStoreInjectable;
