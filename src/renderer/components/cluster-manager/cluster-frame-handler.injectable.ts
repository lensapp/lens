/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../common/cluster-store/get-by-id.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import windowFilePathInjectable from "../../../common/vars/window-file-path.injectable";
import { ClusterFrameHandler } from "./cluster-frame-handler";
import emitClusterVisibilityInjectable from "./emit-cluster-visibility.injectable";

const clusterFrameHandlerInjectable = getInjectable({
  id: "cluster-frame-handler",
  instantiate: (di) => new ClusterFrameHandler({
    emitClusterVisibility: di.inject(emitClusterVisibilityInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    logger: di.inject(loggerInjectable),
    windowFilePath: di.inject(windowFilePathInjectable),
  }),
});

export default clusterFrameHandlerInjectable;
