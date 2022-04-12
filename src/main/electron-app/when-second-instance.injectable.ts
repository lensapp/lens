/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";

interface CallbackArgs {
  commandLineArguments: string[];
}

const whenSecondInstanceInjectable = getInjectable({
  id: "when-second-instance",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (callback: (args: CallbackArgs) => void | Promise<void>) => {
      app.on("second-instance", async (_, commandLineArguments) => {
        await callback({
          commandLineArguments,
        });
      });
    };
  },
});

export default whenSecondInstanceInjectable;
