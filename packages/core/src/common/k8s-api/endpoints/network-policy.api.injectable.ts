/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { NetworkPolicyApi } from "./network-policy.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const networkPolicyApiInjectable = getInjectable({
  id: "network-policy-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "networkPolicyApi is only available in certain environments");

    return new NetworkPolicyApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default networkPolicyApiInjectable;
