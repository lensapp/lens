/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "../window-manager.injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";

const navigateToUrlInjectable = getInjectable({
  id: "navigate-to-url",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);

    return (url) => {
      windowManager.navigate(url);
    };
  },

  injectionToken: navigateToUrlInjectionToken,
});

export default navigateToUrlInjectable;
