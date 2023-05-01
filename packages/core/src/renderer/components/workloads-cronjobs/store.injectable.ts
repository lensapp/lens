/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import getJobsByOwnerInjectable from "../workloads-jobs/get-jobs-by-owner.injectable";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { CronJobStore } from "./store";

const cronJobStoreInjectable = getKubeStoreInjectable({
  id: "cron-job-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "cronJobStore is only available in certain environments");

    const api = di.inject(cronJobApiInjectable);

    return new CronJobStore({
      getJobsByOwner: di.inject(getJobsByOwnerInjectable),
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default cronJobStoreInjectable;
