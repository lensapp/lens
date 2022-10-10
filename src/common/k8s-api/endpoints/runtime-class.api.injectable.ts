/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { RuntimeClassApi } from "./runtime-class.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const runtimeClassApiInjectable = getInjectable({
  id: "runtime-class-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "RuntimeClassApi is only available in certain environments");

    return new RuntimeClassApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default runtimeClassApiInjectable;
