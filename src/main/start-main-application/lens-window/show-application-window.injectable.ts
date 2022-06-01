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
      const windowIsAlreadyBeingShown = someIsTruthy([
        applicationWindow.visible,
        applicationWindow.opening,
        splashWindow.visible,
        splashWindow.opening,
      ]);

      if (windowIsAlreadyBeingShown) {
        return;
      }

      await splashWindow.show();

      await applicationWindow.show();

      splashWindow.close();
    };
  },
});

export default showApplicationWindowInjectable;
