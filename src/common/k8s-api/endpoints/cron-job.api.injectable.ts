/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { CronJobApi } from "./cron-job.api";
import apiManagerInjectable from "../api-manager.injectable";

const cronJobApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/batch/v1beta1/cronjobs") as CronJobApi,
  lifecycle: lifecycleEnum.singleton,
});

export default cronJobApiInjectable;
