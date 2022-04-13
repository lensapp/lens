/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";
import { beforeApplicationSoftQuitInjectionToken } from "../../before-application-soft-quit/before-application-soft-quit-injection-token";
import { runManyFor } from "../../run-many-for";
import whenApplicationWillQuitInjectable from "../../../electron-app/when-application-will-quit.injectable";

const setupClosingOfApplicationInjectable = getInjectable({
  id: "setup-closing-of-application",

  instantiate: (di) => {
    const whenApplicationWillQuit = di.inject(whenApplicationWillQuitInjectable);

    const runManyForApplicationClose = runManyFor(di)(
      beforeApplicationSoftQuitInjectionToken,
    );

    return {
      run: () => {
        whenApplicationWillQuit(async args => {
          await runManyForApplicationClose(args);
        });
      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupClosingOfApplicationInjectable;
