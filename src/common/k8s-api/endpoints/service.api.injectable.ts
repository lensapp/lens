/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ServiceApi } from "./service.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const serviceApiInjectable = getInjectable({
  id: "service-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "serviceApi is only available in certain environments");

    return new ServiceApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default serviceApiInjectable;
