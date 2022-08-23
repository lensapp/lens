/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../directory-for-kube-configs/directory-for-kube-configs.injectable";
import getAbsolutePathInjectable from "../../path/get-absolute-path.injectable";

const getCustomKubeConfigDirectoryInjectable = getInjectable({
  id: "get-custom-kube-config-directory",

  instantiate: (di) => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);

    return (directoryName: string) =>
      getAbsolutePath(directoryForKubeConfigs, directoryName);
  },
});

export default getCustomKubeConfigDirectoryInjectable;
