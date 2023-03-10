/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { applicationWindowInjectionToken } from "./application-window/application-window-injection-token";

const getVisibleWindowsInjectable = getInjectable({
  id: "get-visible-windows",

  instantiate: (di) => () => (
    di.injectMany(applicationWindowInjectionToken)
      .filter(window => window.isVisible)
  ),
});

export default getVisibleWindowsInjectable;
