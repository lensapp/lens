/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ClusterRoleBindingApi } from "./cluster-role-binding.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const clusterRoleBindingApiInjectable = getInjectable({
  id: "cluster-role-binding-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "clusterRoleBindingApi is only accessible in certain environments");

    return new ClusterRoleBindingApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default clusterRoleBindingApiInjectable;
