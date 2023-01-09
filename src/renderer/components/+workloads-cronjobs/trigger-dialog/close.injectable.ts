/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import cronJobTriggerDialogStateInjectable from "./state.injectable";

const closeCronJobTriggerDialogInjectable = getInjectable({
  id: "close-cron-job-trigger-dialog",
  instantiate: (di) => {
    const state = di.inject(cronJobTriggerDialogStateInjectable);

    return action(() => state.set(undefined));
  },
});

export default closeCronJobTriggerDialogInjectable;
