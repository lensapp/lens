/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import type { NavigateToRoute, NavigateToRouteOptions } from "../../common/front-end-routing/navigate-to-route-injection-token";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import currentlyInClusterFrameInjectable from "./currently-in-cluster-frame.injectable";
import { buildURL } from "../../common/utils/buildUrl";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";

const navigateToRouteInjectable = getInjectable({
  id: "navigate-to-route",

  instantiate: (di) => {
    const navigateToUrl = di.inject(navigateToUrlInjectionToken);

    const currentlyInClusterFrame = di.inject(
      currentlyInClusterFrameInjectable,
    );

    return ((route: Route<object | void>, options: NavigateToRouteOptions<object>) => {
      const url = buildURL(route.path, {
        params: options?.parameters,
        query: options?.query,
        fragment: options?.fragment,
      });

      navigateToUrl(url, {
        ...options,
        forceRootFrame: currentlyInClusterFrame && route.clusterFrame === false,
      });
    }) as NavigateToRoute;
  },

  injectionToken: navigateToRouteInjectionToken,
});

export default navigateToRouteInjectable;
