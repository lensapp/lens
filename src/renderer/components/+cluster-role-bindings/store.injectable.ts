/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ClusterRoleBindingStore } from "./store";

const clusterRoleBindingStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/rbac.authorization.k8s.io/v1/clusterrolebindings") as ClusterRoleBindingStore,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterRoleBindingStoreInjectable;
