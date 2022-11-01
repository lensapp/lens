/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { initAppPathsOnMainInjectable } from "../../main/app-paths/impl.injectable";
import { initAppPathsOnRendererInjectable } from "../../renderer/app-paths/impl.injectable";
import { createDependentInitializableState } from "../initializable-state/create-dependent";
import { appPathsInjectionToken } from "./token";

const {
  value: directoryForTempInjectable,
  initializers: [
    initDirectoryForTempOnMainInjectable,
    initDirectoryForTempOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-temp",
  init: (di) => di.inject(appPathsInjectionToken).get().temp,
  initAfter: [initAppPathsOnMainInjectable, initAppPathsOnRendererInjectable],
});

export {
  initDirectoryForTempOnMainInjectable,
  initDirectoryForTempOnRendererInjectable,
};

export default directoryForTempInjectable;
