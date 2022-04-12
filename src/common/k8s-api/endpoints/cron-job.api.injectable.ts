/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { CronJobApi } from "./cron-job.api";

const cronJobApiInjectable = getInjectable({
  id: "cron-job-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "cronJobApi is only available in certain environments");

    return new CronJobApi();
  },
});

export default cronJobApiInjectable;
