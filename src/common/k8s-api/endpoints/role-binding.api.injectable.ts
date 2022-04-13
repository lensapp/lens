/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { RoleBindingApi } from "./role-binding.api";

const roleBindingApiInjectable = getInjectable({
  id: "role-binding-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "roleBindingApi is only available in certain environments");

    return new RoleBindingApi();
  },
});

export default roleBindingApiInjectable;
