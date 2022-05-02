/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationIsLoadingWindowInjectable
  from "./application-is-loading-window/application-is-loading-window.injectable";
import applicationWindowInjectable from "./application-window/application-window.injectable";

const showApplicationWindowInjectable = getInjectable({
  id: "show-application-window",

  instantiate: (di) => {
    const applicationWindow = di.inject(applicationWindowInjectable);

    const applicationIsLoadingWindow = di.inject(
      applicationIsLoadingWindowInjectable,
    );

    return async () => {
      if (applicationWindow.visible) {
        return;
      }

      await applicationIsLoadingWindow.show();

      await applicationWindow.show();

      applicationIsLoadingWindow.close();
    };
  },
});

export default showApplicationWindowInjectable;
