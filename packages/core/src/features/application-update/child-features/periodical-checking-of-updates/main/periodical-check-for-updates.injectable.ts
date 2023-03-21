/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "@k8slens/startable-stoppable";
import processCheckingForUpdatesInjectable from "../../../main/process-checking-for-updates.injectable";
import withOrphanPromiseInjectable from "../../../../../common/utils/with-orphan-promise/with-orphan-promise.injectable";

const TWO_HOURS = 1000 * 60 * 60 * 2;

const periodicalCheckForUpdatesInjectable = getInjectable({
  id: "periodical-check-for-updates",

  instantiate: (di) => {
    const withOrphanPromise = di.inject(withOrphanPromiseInjectable);
    const processCheckingForUpdates = withOrphanPromise(di.inject(processCheckingForUpdatesInjectable));

    return getStartableStoppable("periodical-check-for-updates", () => {
      processCheckingForUpdates("periodic");

      const intervalId = setInterval(() => {
        processCheckingForUpdates("periodic");
      }, TWO_HOURS);

      return () => {
        clearInterval(intervalId);
      };
    });
  },

  causesSideEffects: true,
});

export default periodicalCheckForUpdatesInjectable;
