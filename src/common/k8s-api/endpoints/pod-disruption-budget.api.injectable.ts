/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { PodDisruptionBudgetApi } from "./pod-disruption-budget.api";

const podDisruptionBudgetApiInjectable = getInjectable({
  id: "pod-disruption-budget-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "podDisruptionBudgetApi is only available in certain environments");

    return new PodDisruptionBudgetApi();
  },
});

export default podDisruptionBudgetApiInjectable;
