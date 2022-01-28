/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { CronJob } from "../../../common/k8s-api/endpoints";

export interface CronJobTriggerDialogState {
  cronJob: CronJob | null;
}

const cronjobTriggerDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<CronJobTriggerDialogState>({
    cronJob: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default cronjobTriggerDialogStateInjectable;
