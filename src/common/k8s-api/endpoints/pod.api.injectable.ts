/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PodApi } from "./pod.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const podApiInjectable = getInjectable({
  id: "pod-api",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "podApi is only available in certain environments");

    return new PodApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default podApiInjectable;
