/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { route } from "../../router/route";
import buildVersionInjectable from "../../vars/build-version.injectable";

const getVersionRouteInjectable = getRouteInjectable({
  id: "get-version-route",

  instantiate: (di) => route({
    method: "get",
    path: `/version`,
  })(() => ({
    response: {
      version: di.inject(buildVersionInjectable),
    },
  })),
});

export default getVersionRouteInjectable;
