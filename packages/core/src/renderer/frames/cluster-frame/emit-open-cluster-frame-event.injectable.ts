/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import clusterFrameClusterInjectable from "../../cluster-frame-context/cluster-frame-cluster.injectable";

const emitOpenClusterFrameEventInjectable = getInjectable({
  id: "emit-open-cluster-frame-event",
  instantiate: (di) => ({
    id: "emit-open-cluster-frame-event",
    run: () => {
      const emitAppEvent = di.inject(emitAppEventInjectable);
      const cluster = di.inject(clusterFrameClusterInjectable);

      // use setTimeout to remove this from the order of operations
      setTimeout(() => {
        emitAppEvent({
          name: "cluster",
          action: "open",
          params: {
            clusterId: cluster.id,
          },
        });
      });
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default emitOpenClusterFrameEventInjectable;
