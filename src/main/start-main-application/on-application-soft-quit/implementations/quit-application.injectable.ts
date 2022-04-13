/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationHardQuitInjectionToken } from "../../before-application-hard-quit/before-application-hard-quit-injection-token";
import { runManyFor } from "../../run-many-for";
import { onApplicationSoftQuitInjectionToken } from "../on-application-soft-quit-injection-token";
import isIntegrationTestingInjectable from "../../../../common/vars/is-integration-testing.injectable";

const quitApplicationInjectable = getInjectable({
  id: "prevent-application-from-closing-involuntarily",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runOnApplicationQuit = runMany(beforeApplicationHardQuitInjectionToken);
    const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);

    return {
      run: async (runParameter) => {
        if (!isIntegrationTesting) {
          // &&!autoUpdateIsRunning) {
          runParameter.cancel();

          return;
        }

        await runOnApplicationQuit(runParameter);
      },
    };
  },

  causesSideEffects: true,

  injectionToken: onApplicationSoftQuitInjectionToken,
});

export default quitApplicationInjectable;
