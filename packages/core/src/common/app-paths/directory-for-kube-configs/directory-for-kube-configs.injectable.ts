/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";
import joinPathsInjectable from "../../path/join-paths.injectable";

const directoryForKubeConfigsInjectable = getInjectable({
  id: "directory-for-kube-configs",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData, "kubeconfigs");
  },
});

export default directoryForKubeConfigsInjectable;
