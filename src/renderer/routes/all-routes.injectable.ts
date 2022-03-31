/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { overSome } from "lodash/fp";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../extensions/renderer-extensions.injectable";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import { Route, routeInjectionToken } from "../../common/front-end-routing/route-injection-token";

const allRoutesInjectable = getInjectable({
  id: "all-routes",

  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const enabledExtensions = extensions.get();

      return di
        .injectMany(routeInjectionToken)
        .filter((route) =>
          overSome([
            isNonExtensionRoute,
            isEnabledExtensionRouteFor(enabledExtensions),
          ])(route),
        );
    });
  },
});

const isNonExtensionRoute = (route: Route<unknown>) => !route.extension;

const isEnabledExtensionRouteFor =
  (enabledExtensions: LensRendererExtension[]) => (route: Route<unknown>) =>
    !!enabledExtensions.find((x) => x === route.extension);

export default allRoutesInjectable;
