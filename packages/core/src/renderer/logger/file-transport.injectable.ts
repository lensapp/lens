/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { transports } from "winston";
import directoryForLogsInjectable from "../../common/app-paths/directory-for-logs.injectable";
import { loggerTransportInjectionToken } from "../../common/logger/transports";
import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { getClusterIdFromHost } from "../utils";

const rendererFileLoggerTransportInjectable = getInjectable({
  id: "renderer-file-logger-transport",
  instantiate: (di) => {
    let frameId: string;

    const currentlyInClusterFrame = di.inject(
      currentlyInClusterFrameInjectable,
    );

    if (currentlyInClusterFrame) {
      const { host } = di.inject(windowLocationInjectable);
      const clusterId = getClusterIdFromHost(host);

      frameId = clusterId ? `cluster-${clusterId}` : "cluster";
    } else {
      frameId = "main";
    }

    return new transports.File({
      handleExceptions: false,
      level: "info",
      filename: `lens-renderer-${frameId}.log`,
      dirname: di.inject(directoryForLogsInjectable),
      maxsize: 1024 * 1024,
      maxFiles: 0,
      tailable: true,
    });
  },
  injectionToken: loggerTransportInjectionToken,
});

export default rendererFileLoggerTransportInjectable;
