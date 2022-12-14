/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../common/runnable/run-many-for";
import { beforeFrameStartsInjectionToken, beforeClusterFrameStartsInjectionToken, beforeFrameStartsFirstInjectionToken, beforeMainFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";

const startFrameInjectable = getInjectable({
  id: "start-frame",

  // TODO: Consolidate contents of bootstrap.tsx here
  instantiate: (di) => {
    const runMany = runManyFor(di);
    const beforeFrameStartsFirst = runMany(beforeFrameStartsFirstInjectionToken);
    const beforeMainFrameStarts = runMany(beforeMainFrameStartsInjectionToken);
    const beforeClusterFrameStarts = runMany(beforeClusterFrameStartsInjectionToken);
    const beforeFrameStarts = runMany(beforeFrameStartsInjectionToken);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    return async () => {
      await beforeFrameStartsFirst();

      if (currentlyInClusterFrame) {
        await beforeClusterFrameStarts();
      } else {
        await beforeMainFrameStarts();
      }

      await beforeFrameStarts();
    };
  },
});

export default startFrameInjectable;
