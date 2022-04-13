/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import podSecurityPolicyApiInjectable from "../../../common/k8s-api/endpoints/pod-security-policy.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { PodSecurityPolicyStore } from "./store";

const podSecurityPolicyStoreInjectable = getInjectable({
  id: "pod-security-policy-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "podSecurityPolicyStore is only available in certain environments");

    const api = di.inject(podSecurityPolicyApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new PodSecurityPolicyStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default podSecurityPolicyStoreInjectable;
