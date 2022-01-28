/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { NetworkPolicyApi } from "./network-policy.api";

const networkPolicyApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/networking.k8s.io/v1/networkpolicies") as NetworkPolicyApi,
  lifecycle: lifecycleEnum.singleton,
});

export default networkPolicyApiInjectable;
