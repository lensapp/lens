/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { CronJob } from "../../../../common/k8s-api/endpoints";
import cronJobTriggerDialogStateInjectable from "./state.injectable";

export type OpenCronJobTriggerDialog = (cronJob: CronJob) => void;

const openCronJobTriggerDialogInjectable = getInjectable({
  id: "open-cron-job-trigger-dialog",
  instantiate: (di): OpenCronJobTriggerDialog => {
    const state = di.inject(cronJobTriggerDialogStateInjectable);

    return action((cronJob) => state.set(cronJob));
  },
});

export default openCronJobTriggerDialogInjectable;
