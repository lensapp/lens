/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getHostedClusterId } from "../utils";
import getClusterByIdInjectable from "./get-by-id.injectable";

const hostedClusterInjectable = getInjectable({
  id: "hosted-cluster",

  instantiate: (di) => {
    const hostedClusterId = getHostedClusterId();
    const getClusterById = di.inject(getClusterByIdInjectable);

    return getClusterById(hostedClusterId);
  },
});

export default hostedClusterInjectable;
