/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { NetworkPolicyStore } from "./store";

const networkPolicyStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/networking.k8s.io/v1/networkpolicies") as NetworkPolicyStore,
  lifecycle: lifecycleEnum.singleton,
});

export default networkPolicyStoreInjectable;
