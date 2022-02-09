/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { routePortForward } from "./route-port-forward";
import { getInjectable } from "@ogre-tools/injectable";
import createPortForwardInjectable from "../create-port-forward.injectable";

const routePortForwardInjectable = getInjectable({
  id: "route-port-forward",

  instantiate: (di) => routePortForward({
    createPortForward: di.inject(createPortForwardInjectable),
  }),
});

export default routePortForwardInjectable;
