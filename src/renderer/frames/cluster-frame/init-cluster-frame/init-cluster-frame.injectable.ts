/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initClusterFrame } from "./init-cluster-frame";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import catalogEntityRegistryInjectable from "../../../api/catalog/entity/registry.injectable";
import frameRoutingIdInjectable from "./frame-routing-id/frame-routing-id.injectable";
import hostedClusterInjectable from "../../../../common/cluster-store/hosted-cluster.injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";
import clusterFrameContextInjectable from "../../../cluster-frame-context/cluster-frame-context.injectable";
import assert from "assert";
import autoRegistrationInjectable from "../../../../common/k8s-api/api-manager/auto-registration.injectable";

const initClusterFrameInjectable = getInjectable({
  id: "init-cluster-frame",

  instantiate: (di) => {
    const hostedCluster = di.inject(hostedClusterInjectable);

    assert(hostedCluster, "This can only be injected within a cluster frame");

    /**
     * This is injected here to initialize it for the side effect.
     *
     * The side effect CANNOT be within `apiManagerInjectable` itself since that causes circular
     * dependencies with the current need for legacy di use
     */
    di.inject(autoRegistrationInjectable);

    return initClusterFrame({
      hostedCluster,
      loadExtensions: di.inject(extensionLoaderInjectable).loadOnClusterRenderer,
      catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
      frameRoutingId: di.inject(frameRoutingIdInjectable),
      emitEvent: di.inject(appEventBusInjectable).emit,
      clusterFrameContext: di.inject(clusterFrameContextInjectable),
    });
  },
});

export default initClusterFrameInjectable;
