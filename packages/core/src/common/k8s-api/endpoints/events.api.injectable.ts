/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { KubeEventApi } from "./events.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const kubeEventApiInjectable = getInjectable({
  id: "kube-event-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "kubeEventApi is only available in certain environments");

    return new KubeEventApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default kubeEventApiInjectable;
