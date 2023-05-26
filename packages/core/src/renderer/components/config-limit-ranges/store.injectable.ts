/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { limitRangeApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { LimitRangeStore } from "./store";

const limitRangeStoreInjectable = getInjectable({
  id: "limit-range-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "limitRangeStore is only available in certain environments");

    const api = di.inject(limitRangeApiInjectable);

    return new LimitRangeStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default limitRangeStoreInjectable;
