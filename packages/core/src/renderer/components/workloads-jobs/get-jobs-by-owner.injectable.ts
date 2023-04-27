/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CronJob, Job } from "@k8slens/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import jobStoreInjectable from "./store.injectable";

export type GetJobsByOwner = (cronJob: CronJob) => Job[];

const getJobsByOwnerInjectable = getInjectable({
  id: "get-jobs-by-owner",
  instantiate: (di): GetJobsByOwner => {
    const store = di.inject(jobStoreInjectable);

    return (cronJob) => store.getJobsByOwner(cronJob);
  },
});

export default getJobsByOwnerInjectable;
