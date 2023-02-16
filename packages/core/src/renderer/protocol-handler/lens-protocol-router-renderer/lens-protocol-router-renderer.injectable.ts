/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProtocolRouterRenderer } from "./lens-protocol-router-renderer";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import showErrorNotificationInjectable from "../../components/notifications/show-error-notification.injectable";
import showShortInfoNotificationInjectable from "../../components/notifications/show-short-info.injectable";
import findExtensionInstanceByNameInjectable from "../../../features/extensions/loader/common/find-instance-by-name.injectable";

const lensProtocolRouterRendererInjectable = getInjectable({
  id: "lens-protocol-router-renderer",

  instantiate: (di) => new LensProtocolRouterRenderer({
    extensionsStore: di.inject(extensionsStoreInjectable),
    logger: di.inject(loggerInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    showShortInfoNotification: di.inject(showShortInfoNotificationInjectable),
    findExtensionInstanceByName: di.inject(findExtensionInstanceByNameInjectable),
  }),
});

export default lensProtocolRouterRendererInjectable;
