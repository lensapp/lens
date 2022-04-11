/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ClusterRoleApi } from "./cluster-role.api";

const clusterRoleApiInjectable = getInjectable({
  id: "cluster-role-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "clusterRoleApi is only available in certain environments");

    return new ClusterRoleApi();
  },
});

export default clusterRoleApiInjectable;
