/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";
import isIntegrationTestingInjectable from "../../common/vars/is-integration-testing.injectable";
import autoUpdaterInjectable from "./auto-updater.injectable";

interface CallbackArgs {
  cancel: () => void;
  shouldOnlySoftQuit: boolean;
}

const whenApplicationWillQuitInjectable = getInjectable({
  id: "when-application-will-quit",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    const isIntegrationTesting = di.inject(isIntegrationTestingInjectable);
    const autoUpdater = di.inject(autoUpdaterInjectable);

    let isAutoUpdating = false;

    return (callback: (args: CallbackArgs) => void) => {
      autoUpdater.on("before-quit-for-update", () => {
        isAutoUpdating = true;
      });

      app.on("will-quit", (event) => {
        const shouldHardQuit = isIntegrationTesting || isAutoUpdating;

        callback({
          cancel: () => {
            event.preventDefault();
          },

          shouldOnlySoftQuit: !shouldHardQuit,
        });
      });
    };
  },
});

export default whenApplicationWillQuitInjectable;
