/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { VersionDetector } from "./version-detector";
import k8sRequestInjectable from "../k8s-request.injectable";
import type { Cluster } from "../../common/cluster/cluster";

const createVersionDetectorInjectable = getInjectable({
  id: "create-version-detector",

  instantiate: (di) => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return (cluster: Cluster) =>
      new VersionDetector(cluster, k8sRequest);
  },
});

export default createVersionDetectorInjectable;
