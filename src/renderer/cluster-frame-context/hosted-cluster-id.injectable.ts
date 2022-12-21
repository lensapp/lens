/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { TypedRegEx } from "typed-regex";

const clusterIdMatcher = TypedRegEx("^cluster-frame-(?<clusterId>.+)$");

const hostedClusterIdInjectable = getInjectable({
  id: "hosted-cluster-id",
  instantiate: () => {
    const { frameElement } = window;

    if (!frameElement) {
      return undefined;
    }

    return clusterIdMatcher.match(frameElement.id).groups?.clusterId;
  },
  causesSideEffects: true,
});

export default hostedClusterIdInjectable;
