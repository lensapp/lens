/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { configure } from "mobx";
import { beforeFrameStartsFirstInjectionToken } from "../tokens";

const configureMobxInjectable = getInjectable({
  id: "configure-mobx",
  instantiate: () => ({
    run: () => {
      // Docs: https://mobx.js.org/configuration.html
      configure({
        enforceActions: "never",

        // TODO: enable later (read more: https://mobx.js.org/migrating-from-4-or-5.html)
        // computedRequiresReaction: true,
        // reactionRequiresObservable: true,
        // observableRequiresReaction: true,
      });
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default configureMobxInjectable;
