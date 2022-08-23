/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ResourceQuotaApi } from "./resource-quota.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const resourceQuotaApiInjectable = getInjectable({
  id: "resource-quota-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "resourceQuotaApi is only available in certain environments");

    return new ResourceQuotaApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default resourceQuotaApiInjectable;
