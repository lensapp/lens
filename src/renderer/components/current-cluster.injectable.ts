/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getClusterByIdInjectable from "../../common/cluster-store/get-cluster-by-id.injectable";
import { getHostedClusterId } from "../utils";

const currentClusterInjectable = getInjectable({
  instantiate: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return computed(() => getClusterById(getHostedClusterId()));
  },
  lifecycle: lifecycleEnum.singleton,
});

export default currentClusterInjectable;
