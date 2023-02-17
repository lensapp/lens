/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToExtensionsInjectable from "../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const viewExtensionsDeepLinkingHandlerInjectable = getInjectable({
  id: "view-extensions-deep-linking-handler",
  instantiate: (di) => {
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);

    return {
      path: "/extensions",
      handler: () => navigateToExtensions(),
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default viewExtensionsDeepLinkingHandlerInjectable;
