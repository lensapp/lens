/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterMetricsResourceType } from "../../../../common/cluster-types";
import type {
  KubeObjectDetailsItem,
} from "../../../components/kube-object-details/current-kube-object-in-details.injectable";
import currentKubeObjectInDetailsInjectable from "../../../components/kube-object-details/current-kube-object-in-details.injectable";
import enabledMetricsInjectable from "./metrics-enabled.injectable";

const metricsDetailsComponentEnabledInjectable = getInjectable({
  id: "metrics-details-component-enabled",
  instantiate: (di, kind) => {
    const metricsEnabled = di.inject(enabledMetricsInjectable, kind);
    const currentKubeObjectInDetails = di.inject(currentKubeObjectInDetailsInjectable);

    return computed(() => {
      const kubeObject = currentKubeObjectInDetails.value.get() as KubeObjectDetailsItem;

      if (kubeObject) {
        return kubeObject.kind == kind && metricsEnabled.get();
      }

      return false;
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, kind: ClusterMetricsResourceType) => kind,
  }),
});

export default metricsDetailsComponentEnabledInjectable;
