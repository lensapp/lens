/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterMetricsResourceType } from "../../../../common/cluster-types";
import currentKubeObjectInDetailsInjectable from "../../../components/kube-object-details/current-kube-object-in-details.injectable";
import enabledMetricsInjectable from "./metrics-enabled.injectable";

const metricsDetailsComponentEnabledInjectable = getInjectable({
  id: "metrics-details-component-enabled",
  instantiate: (di, kind) => {
    const metricsEnabled = di.inject(enabledMetricsInjectable, kind);
    const currentKubeObjectInDetails = di.inject(currentKubeObjectInDetailsInjectable);

    return computed(() => {
      const current = currentKubeObjectInDetails.value.get();

      if (!current?.object) {
        return false;
      }

      return metricsEnabled.get() && current.object.kind == kind;
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, kind: ClusterMetricsResourceType) => kind,
  }),
});

export default metricsDetailsComponentEnabledInjectable;
