/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const landingPageDeepLinkingHandlerInjectable = getInjectable({
  id: "landing-page-deep-linking-handler",
  instantiate: (di) => {
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);

    return {
      path: "/landing",
      handler: () => navigateToCatalog(),
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default landingPageDeepLinkingHandlerInjectable;
