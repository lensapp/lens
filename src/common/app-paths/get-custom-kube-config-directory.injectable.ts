/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import directoryForKubeConfigsInjectable from "./directory-for-kube-configs.injectable";

const getCustomKubeConfigDirectoryInjectable = getInjectable({
  instantiate: (di) => (directoryName: string) => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);

    return path.resolve(
      directoryForKubeConfigs,
      directoryName,
    );
  },

  lifecycle: lifecycleEnum.singleton,
});

export default getCustomKubeConfigDirectoryInjectable;
