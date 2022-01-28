/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { RoleBindingApi } from "./role-binding.api";

const roleBindingApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/rbac.authorization.k8s.io/v1/rolebindings") as RoleBindingApi,
  lifecycle: lifecycleEnum.singleton,
});

export default roleBindingApiInjectable;
