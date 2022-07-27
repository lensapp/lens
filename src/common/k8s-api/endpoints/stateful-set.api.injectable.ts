/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { StatefulSetApi } from "./stateful-set.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const statefulSetApiInjectable = getInjectable({
  id: "stateful-set-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "statefulSetApi is only available in certain environments");

    return new StatefulSetApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default statefulSetApiInjectable;
