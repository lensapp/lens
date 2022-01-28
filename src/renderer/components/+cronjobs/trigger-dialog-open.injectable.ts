/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { CronJob } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { CronJobTriggerDialogState } from "./trigger-dialog.state.injectable";
import cronjobTriggerDialogStateInjectable from "./trigger-dialog.state.injectable";

interface Dependencies {
  cronjobTriggerDialogState: CronJobTriggerDialogState;
}

function openCronJobTriggerDialog({ cronjobTriggerDialogState }: Dependencies, cronJob: CronJob): void {
  cronjobTriggerDialogState.cronJob = cronJob;
}

const openCronJobTriggerDialogInjectable = getInjectable({
  instantiate: (di) => bind(openCronJobTriggerDialog, null, {
    cronjobTriggerDialogState: di.inject(cronjobTriggerDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openCronJobTriggerDialogInjectable;
