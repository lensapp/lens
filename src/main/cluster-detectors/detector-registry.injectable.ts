/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { DetectorRegistry } from "./detector-registry";
import k8sRequestInjectable from "../k8s-request.injectable";

const detectorRegistryInjectable = getInjectable({
  id: "detector-registry",

  instantiate: (di) =>
    new DetectorRegistry({ k8sRequest: di.inject(k8sRequestInjectable) }),
});

export default detectorRegistryInjectable;
