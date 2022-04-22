/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getJobsByOwnerInjectable from "../+workloads-jobs/get-jobs-by-owner.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { CronJobStore } from "./store";

const cronJobStoreInjectable = getInjectable({
  id: "cron-job-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "cronJobStore is only available in certain environments");

    const api = di.inject(cronJobApiInjectable);

    return new CronJobStore({
      getJobsByOwner: di.inject(getJobsByOwnerInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default cronJobStoreInjectable;
