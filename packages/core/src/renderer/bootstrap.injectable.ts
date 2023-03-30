/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import { bootstrap } from "./bootstrap";
import startFrameInjectable from "./start-frame/start-frame.injectable";

const bootstrapInjectable = getInjectable({
  id: "bootstrap",

  instantiate: (di) => ({
    run: async () => {
      await bootstrap(di);
    },

    runAfter: startFrameInjectable,
  }),

  causesSideEffects: true,

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default bootstrapInjectable;
