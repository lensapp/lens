/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { RoleApi } from "./role.api";

const roleApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/rbac.authorization.k8s.io/v1/roles") as RoleApi,
  lifecycle: lifecycleEnum.singleton,
});

export default roleApiInjectable;
