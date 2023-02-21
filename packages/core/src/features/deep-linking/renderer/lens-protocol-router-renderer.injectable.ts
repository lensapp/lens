/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";
import findExtensionInstanceByNameInjectable from "../../extensions/loader/common/find-instance-by-name.injectable";
import internalDeepLinkingRoutesInjectable from "./internal-deep-linking-routes.injectable";
import protocolHandlerLoggerInjectable from "../../../common/protocol-handler/logger.injectable";
import { LensProtocolRouter } from "../../../common/protocol-handler";

const deepLinkingRouterInjectable = getInjectable({
  id: "deep-linking-router",
  instantiate: (di) => new LensProtocolRouter({
    extensionsStore: di.inject(extensionsStoreInjectable),
    logger: di.inject(protocolHandlerLoggerInjectable),
    findExtensionInstanceByName: di.inject(findExtensionInstanceByNameInjectable),
    internalRoutes: di.inject(internalDeepLinkingRoutesInjectable),
  }),
});

export default deepLinkingRouterInjectable;
