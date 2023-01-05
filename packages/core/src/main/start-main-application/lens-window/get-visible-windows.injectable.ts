/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter } from "lodash/fp";
import { applicationWindowInjectionToken } from "./application-window/application-window-injection-token";

const getVisibleWindowsInjectable = getInjectable({
  id: "get-visible-windows",

  instantiate: (di) => {
    const getAllLensWindows = () => di.injectMany(applicationWindowInjectionToken);

    return () =>
      pipeline(
        getAllLensWindows(),
        filter((lensWindow) => !!lensWindow.isVisible),
      );
  },
});

export default getVisibleWindowsInjectable;
