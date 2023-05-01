/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import serviceAccountApiInjectable from "../../../../common/k8s-api/endpoints/service-account.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { getKubeStoreInjectable } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import { ServiceAccountStore } from "./store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const serviceAccountStoreInjectable = getKubeStoreInjectable({
  id: "service-account-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "serviceAccountStore is only available in certain environments");

    const api = di.inject(serviceAccountApiInjectable);

    return new ServiceAccountStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default serviceAccountStoreInjectable;
