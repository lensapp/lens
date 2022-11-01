/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { initAppPathsOnMainInjectable } from "../../main/app-paths/impl.injectable";
import { initAppPathsOnRendererInjectable } from "../../renderer/app-paths/impl.injectable";
import { createDependentInitializableState } from "../initializable-state/create";
import { appPathsInjectionToken } from "./token";

const {
  value: directoryForDownloadsInjectable,
  initializers: [
    initDirectoryForDownloadsOnMainInjectable,
    initDirectoryForDownloadsOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-downloads",
  init: (di) => di.inject(appPathsInjectionToken).get().downloads,
  initAfter: [initAppPathsOnMainInjectable, initAppPathsOnRendererInjectable],
});

export {
  initDirectoryForDownloadsOnMainInjectable,
  initDirectoryForDownloadsOnRendererInjectable,
};

export default directoryForDownloadsInjectable;
