/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import attemptInstallByInfoInjectable from "../../components/+extensions/attempt-install-by-info/attempt-install-by-info.injectable";
import { addInternalProtocolRouteHandlers } from "./bind-protocol-add-route-handlers";
import lensProtocolRouterRendererInjectable from "../lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import getEntityByIdInjectable from "../../catalog/get-entity-by-id.injectable";
import { bind } from "../../utils";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";

const addInternalProtocolRouteHandlersInjectable = getInjectable({
  instantiate: (di) => bind(addInternalProtocolRouteHandlers, null, {
    attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
    lensProtocolRouterRenderer: di.inject(lensProtocolRouterRendererInjectable),
    getEntityById: di.inject(getEntityByIdInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default addInternalProtocolRouteHandlersInjectable;
