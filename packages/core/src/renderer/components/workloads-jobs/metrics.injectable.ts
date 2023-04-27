/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { Job } from "@k8slens/kube-object";
import requestPodMetricsForJobsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-jobs.injectable";

const jobMetricsInjectable = getInjectable({
  id: "job-metrics",
  instantiate: (di, job) => {
    const requestPodMetricsForJobs = di.inject(requestPodMetricsForJobsInjectable);

    return asyncComputed({
      getValueFromObservedPromise: () => {
        now(60 * 1000);

        return requestPodMetricsForJobs([job], job.getNs());
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, job: Job) => job.getId(),
  }),
});

export default jobMetricsInjectable;
