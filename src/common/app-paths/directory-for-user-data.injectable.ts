/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { initAppPathsOnMainInjectable } from "../../main/app-paths/impl.injectable";
import { initAppPathsOnRendererInjectable } from "../../renderer/app-paths/impl.injectable";
import { createDependentInitializableState } from "../initializable-state/create-dependent";
import { appPathsInjectionToken } from "./token";

const {
  value: directoryForUserDataInjectable,
  initializers: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-user-data",
  init: (di) => di.inject(appPathsInjectionToken).get().userData,
  initAfter: [initAppPathsOnMainInjectable, initAppPathsOnRendererInjectable],
});

export {
  initDirectoryForUserDataOnMainInjectable,
  initDirectoryForUserDataOnRendererInjectable,
};

export default directoryForUserDataInjectable;
