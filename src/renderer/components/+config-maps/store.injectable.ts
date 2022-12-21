/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import configMapApiInjectable from "../../../common/k8s-api/endpoints/config-map.api.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { ConfigMapStore } from "./store";

const configMapStoreInjectable = getInjectable({
  id: "config-map-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "configMapStore is only available in certain environments");

    const api = di.inject(configMapApiInjectable);

    return new ConfigMapStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default configMapStoreInjectable;
