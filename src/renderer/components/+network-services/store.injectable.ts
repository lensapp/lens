/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import serviceApiInjectable from "../../../common/k8s-api/endpoints/service.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { ServiceStore } from "./store";

const serviceStoreInjectable = getInjectable({
  id: "service-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "serviceStore is only available in certain environments");

    const api = di.inject(serviceApiInjectable);

    return new ServiceStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default serviceStoreInjectable;
