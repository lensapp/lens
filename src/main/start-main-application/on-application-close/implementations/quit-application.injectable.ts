/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onApplicationQuitInjectionToken } from "../../on-application-quit/on-application-quit-injection-token";
import { isIntegrationTesting } from "../../../../common/vars";
import { runManyFor } from "../../run-many-for";
import { onApplicationCloseInjectionToken } from "../on-application-close-injection-token";

const quitApplicationInjectable = getInjectable({
  id: "prevent-application-from-closing-involuntarily",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runOnApplicationQuit = runMany(onApplicationQuitInjectionToken);

    return {
      run: async ({ event }) => {
        if (!isIntegrationTesting) {
          // &&!autoUpdateIsRunning) {
          event.preventDefault();

          return;
        }

        await runOnApplicationQuit({ event });
      },
    };
  },

  causesSideEffects: true,

  injectionToken: onApplicationCloseInjectionToken,
});

export default quitApplicationInjectable;
