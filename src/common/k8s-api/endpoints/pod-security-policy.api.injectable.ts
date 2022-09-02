/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PodSecurityPolicyApi } from "./pod-security-policy.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const podSecurityPolicyApiInjectable = getInjectable({
  id: "pod-security-policy-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "podSecurityPolicyApi is only available in certain environments");

    return new PodSecurityPolicyApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default podSecurityPolicyApiInjectable;
