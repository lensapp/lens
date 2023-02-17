/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../../main/library";
import autoInitExtensionsInjectable from "../common/auto-init-extensions.injectable";

const runAutoInitExtensionsInjectable = getInjectable({
  id: "run-auto-init-extensions",
  instantiate: (di) => ({
    id: "run-auto-init-extensions",
    run: async () => {
      const autoInitExtensions = di.inject(autoInitExtensionsInjectable);

      await autoInitExtensions();
    },
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
});

export default runAutoInitExtensionsInjectable;
