/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodByIdInjectable from "../+workloads-pods/get-pod-by-id.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import kubeEventApiInjectable from "../../../common/k8s-api/endpoints/events.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { EventStore } from "./store";

const eventStoreInjectable = getInjectable({
  id: "event-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "eventStore is only available in certain environments");

    const api = di.inject(kubeEventApiInjectable);

    return new EventStore({
      getPodById: di.inject(getPodByIdInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default eventStoreInjectable;
