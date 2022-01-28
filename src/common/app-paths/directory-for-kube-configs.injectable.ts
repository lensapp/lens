/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "./directory-for-user-data.injectable";
import path from "path";

const directoryForKubeConfigsInjectable = getInjectable({
  instantiate: (di) =>
    path.resolve(di.inject(directoryForUserDataInjectable), "kubeconfigs"),

  lifecycle: lifecycleEnum.singleton,
});

export default directoryForKubeConfigsInjectable;
