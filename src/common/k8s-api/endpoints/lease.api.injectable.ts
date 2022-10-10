/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { LeaseApi } from "./lease.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const leaseApiInjectable = getInjectable({
  id: "lease-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "leaseApi is only available in certain environments");

    return new LeaseApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default leaseApiInjectable;
