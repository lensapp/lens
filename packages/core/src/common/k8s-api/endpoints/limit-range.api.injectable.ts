/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { LimitRangeApi } from "./limit-range.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const limitRangeApiInjectable = getInjectable({
  id: "limit-range-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "limitRangeApi is only available in certain environments");

    return new LimitRangeApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default limitRangeApiInjectable;
