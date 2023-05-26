/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { customResourceDefinitionApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { CustomResourceDefinitionStore } from "./store";

const customResourceDefinitionStoreInjectable = getInjectable({
  id: "custom-resource-definition-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "customResourceDefinitionStore is only available in certain environments");

    const api = di.inject(customResourceDefinitionApiInjectable);

    return new CustomResourceDefinitionStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default customResourceDefinitionStoreInjectable;
