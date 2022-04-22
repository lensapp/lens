/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import podApiInjectable from "../../../common/k8s-api/endpoints/pod.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import { PodStore } from "./store";
import podMetricsApiInjectable from "../../../common/k8s-api/endpoints/pod-metrics.api.injectable";

const podStoreInjectable = getInjectable({
  id: "pod-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "podStore is only available in certain environements");

    const api = di.inject(podApiInjectable);

    return new PodStore({
      podMetricsApi: di.inject(podMetricsApiInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default podStoreInjectable;
