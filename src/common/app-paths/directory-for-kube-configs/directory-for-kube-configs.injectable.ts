/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../directory-for-user-data/directory-for-user-data.injectable";
import path from "path";

const directoryForKubeConfigsInjectable = getInjectable({
  id: "directory-for-kube-configs",

  instantiate: (di) =>
    path.resolve(di.inject(directoryForUserDataInjectable), "kubeconfigs"),
});

export default directoryForKubeConfigsInjectable;
