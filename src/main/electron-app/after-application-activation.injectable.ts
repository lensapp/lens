/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";
import type { ActivationArgs } from "../start-main-application/after-application-activation/after-application-activation-injection-token";

const afterApplicationActivationInjectable = getInjectable({
  id: "after-application-activation",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (callback: (args: ActivationArgs) => Promise<void>) => {
      app.on("activate", async (_, windowIsVisible) => {
        await callback({
          windowIsVisible,
        });
      });
    };
  },
});

export default afterApplicationActivationInjectable;
