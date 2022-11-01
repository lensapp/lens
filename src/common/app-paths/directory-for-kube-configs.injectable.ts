/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable, { initDirectoryForUserDataOnMainInjectable, initDirectoryForUserDataOnRendererInjectable } from "./directory-for-user-data.injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import { createDependentInitializableState } from "../initializable-state/create";

const {
  value: directoryForKubeConfigsInjectable,
  initializers: [
    initDirectoryForKubeConfigsOnMainInjectable,
    initDirectoryForKubeConfigsOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "directory-for-kube-configs",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "kubeconfigs");
  },
  initAfter: [
    initDirectoryForUserDataOnMainInjectable,
    initDirectoryForUserDataOnRendererInjectable,
  ],
});

export {
  initDirectoryForKubeConfigsOnMainInjectable,
  initDirectoryForKubeConfigsOnRendererInjectable,
};

export default directoryForKubeConfigsInjectable;
