/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../common/cluster/get-by-id.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import sendSetVisibleClusterInjectable from "../../cluster/send-set-visible.injectable";
import { ClusterFrameHandler } from "./cluster-frame-handler";
import getElementByIdInjectable from "./get-element-by-id.injectable";

const clusterFrameHandlerInjectable = getInjectable({
  id: "cluster-frame-handler",
  instantiate: (di) => new ClusterFrameHandler({
    getClusterById: di.inject(getClusterByIdInjectable),
    sendSetVisibleCluster: di.inject(sendSetVisibleClusterInjectable),
    getElementById: di.inject(getElementByIdInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

export default clusterFrameHandlerInjectable;
