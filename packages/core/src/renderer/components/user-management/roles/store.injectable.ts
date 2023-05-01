/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import roleApiInjectable from "../../../../common/k8s-api/endpoints/role.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { getKubeStoreInjectable } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import { RoleStore } from "./store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const roleStoreInjectable = getKubeStoreInjectable({
  id: "role-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "roleStore is only available in certain environments");

    const api = di.inject(roleApiInjectable);

    return new RoleStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default roleStoreInjectable;
