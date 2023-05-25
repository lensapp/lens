/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { RoleBindingApi } from "@k8slens/kube-api";
import { kubeApiInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

const roleBindingApiInjectable = getInjectable({
  id: "role-binding-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "roleBindingApi is only available in certain environments");

    return new RoleBindingApi({
      logger: di.inject(loggerInjectionToken),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },

  injectionToken: kubeApiInjectionToken,
});

export default roleBindingApiInjectable;
