/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { route } from "../../router/route";
import staticFileRouteHandlerInjectable from "./route-handler.injectable";

const staticFileRouteInjectable = getRouteInjectable({
  id: "static-file-route",

  instantiate: (di) => route({
    method: "get",
    path: `/{path*}`,
  })(di.inject(staticFileRouteHandlerInjectable)),
});

export default staticFileRouteInjectable;
