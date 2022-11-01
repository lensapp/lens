/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { initAppPathsOnMainInjectable } from "../../main/app-paths/impl.injectable";
import { initAppPathsOnRendererInjectable } from "../../renderer/app-paths/impl.injectable";
import { createDependentInitializableState } from "../initializable-state/create";
import { appPathsInjectionToken } from "./token";

const {
  value: directoryForExesInjectable,
  initializers: [
    initDirectoryForExesOnMainInjectable,
    initDirectoryForExesOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-exes",
  init: (di) => di.inject(appPathsInjectionToken).get().exe,
  initAfter: [initAppPathsOnMainInjectable, initAppPathsOnRendererInjectable],
});

export {
  initDirectoryForExesOnMainInjectable,
  initDirectoryForExesOnRendererInjectable,
};

export default directoryForExesInjectable;
