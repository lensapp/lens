/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { PodDisruptionBudgetDetails } from "../../../config-pod-disruption-budgets";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { PodDisruptionBudget } from "@k8slens/kube-object";

const podDisruptionBudgetDetailItemInjectable = getInjectable({
  id: "pod-disruption-budget-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: PodDisruptionBudgetDetails,
      enabled: computed(() => kubeObject.value.get()?.object instanceof PodDisruptionBudget),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default podDisruptionBudgetDetailItemInjectable;
