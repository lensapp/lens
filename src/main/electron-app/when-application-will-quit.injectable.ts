/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";

interface CallbackArgs {
  cancel: () => void;
}

const whenApplicationWillQuitInjectable = getInjectable({
  id: "when-application-will-quit",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (callback: (args: CallbackArgs) => void) => {
      app.on("will-quit", (event) => {
        callback({
          cancel: () => { event.preventDefault(); },
        });
      });
    };
  },
});

export default whenApplicationWillQuitInjectable;
