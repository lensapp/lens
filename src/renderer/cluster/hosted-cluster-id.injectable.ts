/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getClusterIdFromHost } from "../../common/utils";

const hostedClusterIdInjectable = getInjectable({
  id: "hosted-cluster-id",
  instantiate: () => getClusterIdFromHost(location.host),
  causesSideEffects: true,
});

export default hostedClusterIdInjectable;
