/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../utils";
import type { CronJobTriggerDialogState } from "./trigger-dialog.state.injectable";
import cronjobTriggerDialogStateInjectable from "./trigger-dialog.state.injectable";

interface Dependencies {
  cronjobTriggerDialogState: CronJobTriggerDialogState;
}

function closeCronJobTriggerDialog({ cronjobTriggerDialogState }: Dependencies): void {
  cronjobTriggerDialogState.cronJob = null;
}

const closeCronJobTriggerDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeCronJobTriggerDialog, null, {
    cronjobTriggerDialogState: di.inject(cronjobTriggerDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeCronJobTriggerDialogInjectable;
