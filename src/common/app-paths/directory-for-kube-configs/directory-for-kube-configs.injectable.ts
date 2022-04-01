/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";
import getAbsolutePathInjectable from "../../path/get-absolute-path.injectable";

const directoryForKubeConfigsInjectable = getInjectable({
  id: "directory-for-kube-configs",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return getAbsolutePath(
      directoryForUserData,
      "kubeconfigs",
    );
  },
});

export default directoryForKubeConfigsInjectable;
