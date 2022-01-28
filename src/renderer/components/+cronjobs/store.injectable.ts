/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { CronJobStore } from "../../../extensions/renderer-api/k8s-api";

const cronJobStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/batch/v1beta1/cronjobs") as CronJobStore,
  lifecycle: lifecycleEnum.singleton,
});

export default cronJobStoreInjectable;
