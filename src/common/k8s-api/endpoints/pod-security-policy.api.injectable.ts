/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { PodSecurityPolicyApi } from "./pod-security-policy.api";

const podSecurityPolicyApiInjectable = getInjectable({
  id: "pod-security-policy-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "podSecurityPolicyApi is only available in certain environments");

    return new PodSecurityPolicyApi();
  },
});

export default podSecurityPolicyApiInjectable;
