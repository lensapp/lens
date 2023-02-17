/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProtocolRouterMain } from "./lens-protocol-router-main";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";
import findExtensionInstanceByNameInjectable from "../../../features/extensions/loader/common/find-instance-by-name.injectable";
import internalDeepLinkingRoutesInjectable from "../../../features/deep-linking/renderer/internal-deep-linking-routes.injectable";
import protocolHandlerLoggerInjectable from "../../../common/protocol-handler/logger.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  id: "lens-protocol-router-main",

  instantiate: (di) => new LensProtocolRouterMain({
    extensionsStore: di.inject(extensionsStoreInjectable),
    showApplicationWindow: di.inject(showApplicationWindowInjectable),
    broadcastMessage: di.inject(broadcastMessageInjectable),
    logger: di.inject(protocolHandlerLoggerInjectable),
    findExtensionInstanceByName: di.inject(findExtensionInstanceByNameInjectable),
    internalRoutes: di.inject(internalDeepLinkingRoutesInjectable),
  }),
});

export default lensProtocolRouterMainInjectable;
