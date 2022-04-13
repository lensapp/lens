/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationHardQuitInjectionToken } from "../../before-application-hard-quit/before-application-hard-quit-injection-token";
import { runManyFor } from "../../run-many-for";
import { beforeApplicationSoftQuitInjectionToken } from "../before-application-soft-quit-injection-token";
import isIntegrationTestingInjectable from "../../../../common/vars/is-integration-testing.injectable";

const tentativeHardQuitApplicationInjectable = getInjectable({
  id: "tentative-hard-quit-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runRunnablesBeforeApplicationHardQuit = runMany(beforeApplicationHardQuitInjectionToken);
    const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);

    return {
      run: async (runParameter) => {
        if (!isIntegrationTesting) {
          // &&!autoUpdateIsRunning) {
          runParameter.cancel();

          return;
        }

        await runRunnablesBeforeApplicationHardQuit(runParameter);
      },
    };
  },

  causesSideEffects: true,

  injectionToken: beforeApplicationSoftQuitInjectionToken,
});

export default tentativeHardQuitApplicationInjectable;
