/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { once } from "lodash";
import prefixedLoggerInjectable from "../../../common/logger/prefixed-logger.injectable";
import clusterFrameClusterInjectable from "../../cluster-frame-context/cluster-frame-cluster.injectable";
import closeRendererLogFileInjectable from "../../logger/close-renderer-log-file.injectable";
import unmountRootComponentInjectable from "../../window/unmount-root-component.injectable";

const handleOnClusterFrameCloseInjectable = getInjectable({
  id: "handle-on-cluster-frame-close",
  instantiate: (di) => {
    const cluster = di.inject(clusterFrameClusterInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "CLUSTER-FRAME");
    const closeFileLogging = di.inject(closeRendererLogFileInjectable);
    const unmountRootComponent = di.inject(unmountRootComponentInjectable);

    const onCloseFrame = once(() => {
      logger.info(`Unload dashboard, clusterId=${(cluster.id)}`);
      closeFileLogging();
      unmountRootComponent();
    });

    return () => {
      window.addEventListener("beforeunload", onCloseFrame);
      window.addEventListener("pagehide", onCloseFrame);
    };
  },
  causesSideEffects: true,
});

export default handleOnClusterFrameCloseInjectable;
