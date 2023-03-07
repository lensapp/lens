/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { getClusterIdFromHost } from "../utils";

const rendererLogFileIdInjectable = getInjectable({
  id: "renderer-log-file-id",
  instantiate: (di) => {
    let frameId: string;
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    if (currentlyInClusterFrame) {
      const { host } = di.inject(windowLocationInjectable);
      const clusterId = getClusterIdFromHost(host);

      frameId = clusterId ? `cluster-${clusterId}` : "cluster";
    } else {
      frameId = "main";
    }

    return `renderer-${frameId}`;
  },
});

export default rendererLogFileIdInjectable;
