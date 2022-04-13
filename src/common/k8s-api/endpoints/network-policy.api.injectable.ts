/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { NetworkPolicyApi } from "./network-policy.api";

const networkPolicyApiInjectable = getInjectable({
  id: "network-policy-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "networkPolicyApi is only available in certain environments");

    return new NetworkPolicyApi();
  },
});

export default networkPolicyApiInjectable;
