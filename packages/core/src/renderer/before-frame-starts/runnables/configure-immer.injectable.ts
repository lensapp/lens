/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setAutoFreeze, enableMapSet } from "immer";
import { beforeFrameStartsFirstInjectionToken } from "../tokens";

const configureImmerInjectable = getInjectable({
  id: "configure-immer",
  instantiate: () => ({
    run: () => {
      // Docs: https://immerjs.github.io/immer/
      // Required in `utils/storage-helper.ts`
      setAutoFreeze(false); // allow to merge mobx observables
      enableMapSet(); // allow to merge maps and sets
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default configureImmerInjectable;
