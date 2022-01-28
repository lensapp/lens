/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import activeClusterEntityInjectable from "../../../catalog/active-cluster-entity.injectable";

const clusterNameInjectable = getInjectable({
  instantiate: (di) => di.inject(activeClusterEntityInjectable)?.name,
  lifecycle: lifecycleEnum.transient,
});

export default clusterNameInjectable;
