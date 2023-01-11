/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterInjectable from "./cluster.injectable";

const clusterNameInjectable = getInjectable({
  id: "cluster-name",

  instantiate: (di) => {
    const cluster = di.inject(clusterInjectable);

    return cluster?.name;
  },

  lifecycle: lifecycleEnum.transient,
});

export default clusterNameInjectable;
