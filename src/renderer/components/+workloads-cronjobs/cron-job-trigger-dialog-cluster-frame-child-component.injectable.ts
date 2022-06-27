/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { CronJobTriggerDialog } from "./cronjob-trigger-dialog";
import { clusterFrameChildComponentInjectionToken } from "../../frames/cluster-frame/cluster-frame-child-component-injection-token";

const cronJobTriggerDialogClusterFrameChildComponentInjectable = getInjectable({
  id: "cron-job-trigger-dialog-cluster-frame-child-component",

  instantiate: () => ({
    id: "cron-job-trigger-dialog",
    shouldRender: computed(() => true),
    Component: CronJobTriggerDialog,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,

  causesSideEffects: true,
});

export default cronJobTriggerDialogClusterFrameChildComponentInjectable;
