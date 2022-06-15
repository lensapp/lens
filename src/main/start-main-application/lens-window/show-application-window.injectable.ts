/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import splashWindowInjectable from "./splash-window/splash-window.injectable";
import applicationWindowInjectable from "./application-window/application-window.injectable";
import { identity, some } from "lodash/fp";
const someIsTruthy = some(identity);

const showApplicationWindowInjectable = getInjectable({
  id: "show-application-window",

  instantiate: (di) => {
    const applicationWindow = di.inject(applicationWindowInjectable);
    const splashWindow = di.inject(splashWindowInjectable);

    return async () => {
      if (applicationWindow.isStarting) {
        applicationWindow.show();
        splashWindow.close();

        return;
      }

      const windowIsAlreadyBeingShown = someIsTruthy([
        applicationWindow.isVisible,
        splashWindow.isStarting,
      ]);

      if (windowIsAlreadyBeingShown) {
        return;
      }

      await splashWindow.start();

      await applicationWindow.start();

      splashWindow.close();
    };
  },
});

export default showApplicationWindowInjectable;
