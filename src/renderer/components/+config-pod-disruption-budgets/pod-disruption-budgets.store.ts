/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { PodDisruptionBudget, PodDisruptionBudgetApi } from "../../../common/k8s-api/endpoints/poddisruptionbudget.api";
import { podDisruptionBudgetApi } from "../../../common/k8s-api/endpoints/poddisruptionbudget.api";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class PodDisruptionBudgetStore extends KubeObjectStore<PodDisruptionBudget, PodDisruptionBudgetApi> {
}

export const podDisruptionBudgetsStore = isClusterPageContext()
  ? new PodDisruptionBudgetStore(podDisruptionBudgetApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(podDisruptionBudgetsStore);
}
