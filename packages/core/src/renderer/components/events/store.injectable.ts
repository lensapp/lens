/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import getPodByIdInjectable from "../workloads-pods/get-pod-by-id.injectable";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import kubeEventApiInjectable from "../../../common/k8s-api/endpoints/events.api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { EventStore } from "./store";

const eventStoreInjectable = getKubeStoreInjectable({
  id: "event-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "eventStore is only available in certain environments");

    const api = di.inject(kubeEventApiInjectable);

    return new EventStore({
      getPodById: di.inject(getPodByIdInjectable),
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default eventStoreInjectable;
