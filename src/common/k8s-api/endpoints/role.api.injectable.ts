/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { RoleApi } from "./role.api";

const roleApiInjectable = getInjectable({
  id: "role-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "roleApi is only available in certain environments");

    return new RoleApi();
  },
});

export default roleApiInjectable;
