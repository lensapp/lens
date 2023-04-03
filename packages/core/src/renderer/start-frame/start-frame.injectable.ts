/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "@k8slens/run-many";
import * as tokens from "../before-frame-starts/tokens";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";

const startFrameInjectable = getInjectable({
  id: "start-frame",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const beforeFrameStartsFirst = runMany(tokens.beforeFrameStartsFirstInjectionToken);
    const beforeMainFrameStartsFirst = runMany(tokens.beforeMainFrameStartsFirstInjectionToken);
    const beforeClusterFrameStartsFirst = runMany(tokens.beforeClusterFrameStartsFirstInjectionToken);
    const beforeFrameStartsSecond = runMany(tokens.beforeFrameStartsSecondInjectionToken);
    const beforeMainFrameStartsSecond = runMany(tokens.beforeMainFrameStartsSecondInjectionToken);
    const beforeClusterFrameStartsSecond = runMany(tokens.beforeClusterFrameStartsSecondInjectionToken);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    return {
      run: async () => {
        await beforeFrameStartsFirst();

        if (currentlyInClusterFrame) {
          await beforeClusterFrameStartsFirst();
        } else {
          await beforeMainFrameStartsFirst();
        }

        await beforeFrameStartsSecond();

        if (currentlyInClusterFrame) {
          await beforeClusterFrameStartsSecond();
        } else {
          await beforeMainFrameStartsSecond();
        }
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startFrameInjectable;
