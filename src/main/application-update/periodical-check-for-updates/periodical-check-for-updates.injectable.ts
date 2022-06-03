/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import processCheckingForUpdatesInjectable from "../check-for-updates/process-checking-for-updates.injectable";

const periodicalCheckForUpdatesInjectable = getInjectable({
  id: "periodical-check-for-updates",

  instantiate: (di) => {
    const processCheckingForUpdates = di.inject(processCheckingForUpdatesInjectable);

    return getStartableStoppable("periodical-check-for-updates", () => {
      const TWO_HOURS = 1000 * 60 * 60 * 2;

      // Note: intentional orphan promise to make checking for updates happen in the background
      processCheckingForUpdates();

      const intervalId = setInterval(() => {
        // Note: intentional orphan promise to make checking for updates happen in the background
        processCheckingForUpdates();
      }, TWO_HOURS);

      return () => {
        clearInterval(intervalId);
      };
    });
  },

  causesSideEffects: true,
});

export default periodicalCheckForUpdatesInjectable;
