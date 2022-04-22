/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import networkPolicyApiInjectable from "../../../common/k8s-api/endpoints/network-policy.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { NetworkPolicyStore } from "./store";

const networkPolicyStoreInjectable = getInjectable({
  id: "network-policy-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "networkPolicyStore is only available in certain environments");

    const api = di.inject(networkPolicyApiInjectable);

    return new NetworkPolicyStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default networkPolicyStoreInjectable;
