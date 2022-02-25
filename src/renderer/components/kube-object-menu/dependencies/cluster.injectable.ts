/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getActiveClusterEntity } from "../../../api/catalog-entity-registry";

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const clusterInjectable = getInjectable({
  id: "cluster",
  instantiate: () => getActiveClusterEntity(),
  lifecycle: lifecycleEnum.transient,
});

export default clusterInjectable;
