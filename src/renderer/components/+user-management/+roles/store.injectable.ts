/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import roleApiInjectable from "../../../../common/k8s-api/endpoints/role.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/manager.injectable";
import { RoleStore } from "./store";

const roleStoreInjectable = getInjectable({
  id: "role-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "roleStore is only available in certain environments");

    const api = di.inject(roleApiInjectable);

    return new RoleStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default roleStoreInjectable;
