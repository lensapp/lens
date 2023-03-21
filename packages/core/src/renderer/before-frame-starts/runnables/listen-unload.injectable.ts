/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import currentlyInClusterFrameInjectable from "../../routes/currently-in-cluster-frame.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../tokens";
import loggerInjectable from "../../../common/logger.injectable";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import frameRoutingIdInjectable from "../../frames/cluster-frame/init-cluster-frame/frame-routing-id/frame-routing-id.injectable";
import closeRendererLogFileInjectable from "../../logger/close-renderer-log-file.injectable";
import { unmountComponentAtNode } from "react-dom";

const listenUnloadInjectable = getInjectable({
  id: "listen-unload",
  instantiate: (di) => ({
    run: () => {
      const closeRendererLogFile = di.inject(closeRendererLogFileInjectable);
      const isClusterFrame = di.inject(currentlyInClusterFrameInjectable);
      const logger = di.inject(loggerInjectable);

      window.addEventListener("beforeunload", () => {
        if (isClusterFrame) {
          const hostedCluster = di.inject(hostedClusterInjectable);
          const frameRoutingId = di.inject(frameRoutingIdInjectable);

          logger.info(
            `[CLUSTER-FRAME] Unload dashboard, clusterId=${hostedCluster?.id}, frameId=${frameRoutingId}`,
          );
        } else {
          logger.info("[ROOT-FRAME]: Unload app");
        }

        closeRendererLogFile();
        const rootElem = document.getElementById("app");

        if (rootElem) {
          unmountComponentAtNode(rootElem);
        }
      });
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default listenUnloadInjectable;
