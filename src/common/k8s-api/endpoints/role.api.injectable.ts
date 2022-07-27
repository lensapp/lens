/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { RoleApi } from "./role.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const roleApiInjectable = getInjectable({
  id: "role-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "roleApi is only available in certain environments");

    return new RoleApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default roleApiInjectable;
