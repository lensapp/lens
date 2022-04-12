/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";

interface CallbackArgs {
  cancel: () => void;
  url: string;
}

const whenOpeningUrlInjectable = getInjectable({
  id: "when-opening-url",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (callback: (args: CallbackArgs) => void | Promise<void>) => {
      app.on("open-url", async (event, url) => {
        await callback({
          cancel: () => {
            event.preventDefault();
          },

          url,
        });
      });
    };
  },
});

export default whenOpeningUrlInjectable;
