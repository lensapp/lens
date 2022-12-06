/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../common/runnable/run-many-for";
import { beforeFrameStartsInjectionToken, evenBeforeClusterFrameStartsInjectionToken, evenBeforeFrameStartsInjectionToken, evenBeforeMainFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";

const startFrameInjectable = getInjectable({
  id: "start-frame",

  // TODO: Consolidate contents of bootstrap.tsx here
  instantiate: (di) => {
    const runMany = runManyFor(di);
    const evenBeforeFrameStarts = runMany(evenBeforeFrameStartsInjectionToken);
    const evenBeforeMainFrameStarts = runMany(evenBeforeMainFrameStartsInjectionToken);
    const evenBeforeClusterFrameStarts = runMany(evenBeforeClusterFrameStartsInjectionToken);
    const beforeFrameStarts = runMany(beforeFrameStartsInjectionToken);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    return async () => {
      await evenBeforeFrameStarts();

      if (currentlyInClusterFrame) {
        await evenBeforeClusterFrameStarts();
      } else {
        await evenBeforeMainFrameStarts();
      }

      await beforeFrameStarts();
    };
  },
});

export default startFrameInjectable;
