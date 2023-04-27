/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { CronJob } from "@k8slens/kube-object";

const cronJobTriggerDialogStateInjectable = getInjectable({
  id: "cron-job-trigger-dialog-state",
  instantiate: () => observable.box<CronJob>(),
});

export default cronJobTriggerDialogStateInjectable;
