/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { shouldShowResourceInjectionToken } from "../../../../common/cluster-store/allowed-resources-injection-token";
import { byOrderNumber } from "../../../../common/utils/composable-responsibilities/orderable/orderable";
import { workloadInjectionToken } from "./workload-injection-token";

const workloadsInjectable = getInjectable({
  id: "workloads",

  instantiate: (di) => {
    const workloads = di.injectMany(workloadInjectionToken);

    return computed(() => (
      workloads
        .filter(w => di.inject(shouldShowResourceInjectionToken, w.resource).get())
        .sort(byOrderNumber)
    ));
  },
});

export default workloadsInjectable;
