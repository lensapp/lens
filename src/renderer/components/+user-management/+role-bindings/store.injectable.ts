/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/manager.injectable";
import roleBindingApiInjectable from "../../../../common/k8s-api/endpoints/role-binding.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { RoleBindingStore } from "./store";

const roleBindingStoreInjectable = getInjectable({
  id: "role-binding-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "roleBindingStore is only available in certain environments");

    const api = di.inject(roleBindingApiInjectable);

    return new RoleBindingStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default roleBindingStoreInjectable;
