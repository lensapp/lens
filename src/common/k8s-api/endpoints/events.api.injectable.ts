/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { KubeEventApi } from "./events.api";

const kubeEventApiInjectable = getInjectable({
  id: "kube-event-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "kubeEventApi is only available in certain environments");

    return new KubeEventApi();
  },
});

export default kubeEventApiInjectable;
