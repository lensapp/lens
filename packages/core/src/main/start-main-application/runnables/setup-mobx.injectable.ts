/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import * as Mobx from "mobx";
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";

const setupMobxInjectable = getInjectable({
  id: "setup-mobx",

  instantiate: () => ({
    run: () => {
      // Docs: https://mobx.js.org/configuration.html
      Mobx.configure({
        enforceActions: "never",

        // TODO: enable later (read more: https://mobx.js.org/migrating-from-4-or-5.html)
        // computedRequiresReaction: true,
        // reactionRequiresObservable: true,
        // observableRequiresReaction: true,
      });

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupMobxInjectable;
