/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { cronJobStore } from "./cronjob.store";

const cronJobsStoreInjectable = getInjectable({
  id: "cron-jobs-store",
  instantiate: () => cronJobStore,
  causesSideEffects: true,
});

export default cronJobsStoreInjectable;
