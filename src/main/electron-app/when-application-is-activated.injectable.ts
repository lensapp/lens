/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";

interface CallbackArgs {
  windowIsVisible: boolean;
}

const whenApplicationIsActivatedInjectable = getInjectable({
  id: "when-application-is-activated",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (callback: (args: CallbackArgs) => void | Promise<void>) => {
      app.on("activate", async (_, hasVisibleWindows) => {
        await callback({
          windowIsVisible: hasVisibleWindows,
        });
      });
    };
  },
});

export default whenApplicationIsActivatedInjectable;
