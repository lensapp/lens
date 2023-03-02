/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import { navigateToRouteInjectionToken } from "../../common/front-end-routing/navigate-to-route-injection-token";
import currentlyInClusterFrameInjectable from "./currently-in-cluster-frame.injectable";
import { buildURL } from "@k8slens/utilities";

const navigateToRouteInjectable = getInjectable({
  id: "navigate-to-route",

  instantiate: (di) => {
    const navigateToUrl = di.inject(navigateToUrlInjectionToken);

    const currentlyInClusterFrame = di.inject(
      currentlyInClusterFrameInjectable,
    );

    return (route, options) => {
      const url = buildURL(route.path, {
        // TODO: enhance typing
        params: options?.parameters as any,
        query: options?.query,
        fragment: options?.fragment,
      });

      navigateToUrl(url, {
        ...options,
        forceRootFrame: currentlyInClusterFrame && route.clusterFrame === false,
      });
    };
  },

  injectionToken: navigateToRouteInjectionToken,
});

export default navigateToRouteInjectable;
