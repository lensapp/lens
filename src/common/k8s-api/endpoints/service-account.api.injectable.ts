/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ServiceAccountApi } from "./service-account.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const serviceAccountApiInjectable = getInjectable({
  id: "service-account-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "serviceAccountApi is only available in certain environments");

    return new ServiceAccountApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default serviceAccountApiInjectable;
