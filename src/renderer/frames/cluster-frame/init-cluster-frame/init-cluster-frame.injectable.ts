/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initClusterFrame } from "./init-cluster-frame";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import catalogEntityRegistryInjectable from "../../../api/catalog-entity-registry/catalog-entity-registry.injectable";
import frameRoutingIdInjectable from "./frame-routing-id/frame-routing-id.injectable";
import hostedClusterInjectable from "../../../../common/cluster/hosted.injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";
import clusterFrameContextInjectable from "../../../cluster-frame-context/cluster-frame-context.injectable";

const initClusterFrameInjectable = getInjectable({
  id: "init-cluster-frame",

  instantiate: (di) =>
    initClusterFrame({
      hostedCluster: di.inject(hostedClusterInjectable),
      loadExtensions: di.inject(extensionLoaderInjectable).loadOnClusterRenderer,
      catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
      frameRoutingId: di.inject(frameRoutingIdInjectable),
      emitEvent: di.inject(appEventBusInjectable).emit,

      clusterFrameContext: di.inject(clusterFrameContextInjectable),
    }),
});

export default initClusterFrameInjectable;
