/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WindowManager } from "./window-manager";
import lensProxyPortNumberStateInjectable from "./lens-proxy-port-number-state.injectable";

const windowManagerInjectable = getInjectable({
  id: "window-manager",

  instantiate: (di) =>
    new WindowManager({
      lensProxyPortNumberState: di.inject(lensProxyPortNumberStateInjectable),
    }),

  causesSideEffects: true,
});

export default windowManagerInjectable;
