/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { ClusterRoleBindingApi } from "./cluster-role-binding.api";

const clusterRoleBindingApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/rbac.authorization.k8s.io/v1/clusterrolebindings") as ClusterRoleBindingApi,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterRoleBindingApiInjectable;
