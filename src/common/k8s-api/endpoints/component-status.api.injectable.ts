/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ComponentStatusApi } from "./component-status.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const componentStatusApiInjectable = getInjectable({
  id: "component-status-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "componentStatusApi is only available in certain environments");

    return new ComponentStatusApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default componentStatusApiInjectable;
