/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { PodDisruptionBudgetApi } from "./pod-disruption-budget.api";

const podDisruptionBudgetApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/policy/v1beta1/poddisruptionbudgets") as PodDisruptionBudgetApi,
  lifecycle: lifecycleEnum.singleton,
});

export default podDisruptionBudgetApiInjectable;
