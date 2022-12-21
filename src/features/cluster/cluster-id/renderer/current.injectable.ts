/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hostedClusterIdInjectable from "../../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import { currentClusterIdInjectionToken } from "../common/current-token";

const currentClusterIdInjectable = getInjectable({
  id: "current-cluster-id",
  instantiate: (di) => di.inject(hostedClusterIdInjectable),
  injectionToken: currentClusterIdInjectionToken,
});

export default currentClusterIdInjectable;
