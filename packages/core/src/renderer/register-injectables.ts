/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { runInAction } from "mobx";

export function registerInjectables(di: DiContainer) {
  runInAction(() => {
    autoRegister({
      di,
      targetModule: module,
      getRequireContexts: () => [
        require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
        require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
        require.context("../extensions", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
        require.context("../features", true, CONTEXT_MATCHER_FOR_FEATURES),
      ],
    });
  });
}
