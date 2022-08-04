/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import splashWindowInjectable from "./splash-window/splash-window.injectable";
import { identity, some } from "lodash/fp";
import focusApplicationInjectable from "../../electron-app/features/focus-application.injectable";
import getCurrentApplicationWindowInjectable from "./application-window/get-current-application-window.injectable";
import type { LensWindow } from "./application-window/create-lens-window.injectable";
import createFirstApplicationWindowInjectable from "./application-window/create-first-application-window.injectable";
const someIsTruthy = some(identity);

const showApplicationWindowInjectable = getInjectable({
  id: "show-application-window",

  instantiate: (di) => {
    const getApplicationWindow = di.inject(getCurrentApplicationWindowInjectable);
    const createFirstApplicationWindow = di.inject(createFirstApplicationWindowInjectable);
    const splashWindow = di.inject(splashWindowInjectable);
    const focusApplication = di.inject(focusApplicationInjectable);

    return async () => {
      focusApplication();

      let applicationWindow: LensWindow | undefined = getApplicationWindow();

      if (!applicationWindow) {
        applicationWindow = createFirstApplicationWindow();
      }

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
