/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { SecretApi } from "./secret.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const secretApiInjectable = getInjectable({
  id: "secret-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "secretApi is only available in certain environments");

    return new SecretApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default secretApiInjectable;
