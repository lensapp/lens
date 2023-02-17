/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProtocolRouterRenderer } from "./lens-protocol-router-renderer";
import extensionsStoreInjectable from "../../extensions/extensions-store/extensions-store.injectable";
import showErrorNotificationInjectable from "../components/notifications/show-error-notification.injectable";
import showShortInfoNotificationInjectable from "../components/notifications/show-short-info.injectable";
import findExtensionInstanceByNameInjectable from "../../features/extensions/loader/common/find-instance-by-name.injectable";
import internalDeepLinkingRoutesInjectable from "../../features/deep-linking/renderer/internal-deep-linking-routes.injectable";
import protocolHandlerLoggerInjectable from "../../common/protocol-handler/logger.injectable";

const lensProtocolRouterRendererInjectable = getInjectable({
  id: "lens-protocol-router-renderer",

  instantiate: (di) => new LensProtocolRouterRenderer({
    extensionsStore: di.inject(extensionsStoreInjectable),
    logger: di.inject(protocolHandlerLoggerInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    showShortInfoNotification: di.inject(showShortInfoNotificationInjectable),
    findExtensionInstanceByName: di.inject(findExtensionInstanceByNameInjectable),
    internalRoutes: di.inject(internalDeepLinkingRoutesInjectable),
  }),
});

export default lensProtocolRouterRendererInjectable;
