/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "../directory-for-user-data.injectable";
import joinPathsInjectable from "../../path/join-paths.injectable";
import { createLazyInitializableState } from "../../initializable-state/create-lazy";

const directoryForKubeConfigsInjectable = createLazyInitializableState({
  id: "directory-for-kube-configs",

  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "kubeconfigs");
  },
});

export default directoryForKubeConfigsInjectable;
