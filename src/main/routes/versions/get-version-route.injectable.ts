/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { route } from "../../router/route";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";

const getVersionRouteInjectable = getRouteInjectable({
  id: "get-version-route",

  instantiate: (di) => {
    const buildVersion = di.inject(buildVersionInjectable);

    return route({
      method: "get",
      path: `/version`,
    })(() => ({
      response: {
        version: buildVersion.get(),
      },
    }));
  },
});

export default getVersionRouteInjectable;
