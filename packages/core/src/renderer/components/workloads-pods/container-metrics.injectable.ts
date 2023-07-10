/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { Pod, Container } from "@k8slens/kube-object";
import requestPodMetricsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";

interface PodContainerParams {
  pod: Pod;
  container: Container;
}

const podContainerMetricsInjectable = getInjectable({
  id: "pod-container-metrics",
  instantiate: (di, { pod, container }) => {
    const requestPodMetrics = di.inject(requestPodMetricsInjectable);

    return asyncComputed({
      getValueFromObservedPromise: () => {
        now(60 * 1000);

        return requestPodMetrics([pod], pod.getNs(), container, "pod, container, namespace");
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, { pod, container }: PodContainerParams) => {
      return `${pod.getId()}-${container.name}`;
    },
  }),
});

export default podContainerMetricsInjectable;
