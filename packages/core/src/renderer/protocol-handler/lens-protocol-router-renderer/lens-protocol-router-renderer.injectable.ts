/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterRenderer } from "./lens-protocol-router-renderer";
import { loggerInjectionToken } from "@k8slens/logger";
import { showErrorNotificationInjectable, showShortInfoNotificationInjectable } from "@k8slens/notifications";
import isExtensionEnabledInjectable from "../../../features/extensions/enabled/common/is-enabled.injectable";

const lensProtocolRouterRendererInjectable = getInjectable({
  id: "lens-protocol-router-renderer",

  instantiate: (di) => new LensProtocolRouterRenderer({
    extensionLoader: di.inject(extensionLoaderInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    logger: di.inject(loggerInjectionToken),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    showShortInfoNotification: di.inject(showShortInfoNotificationInjectable),
  }),
});

export default lensProtocolRouterRendererInjectable;
