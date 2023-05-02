/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterMain } from "./lens-protocol-router-main";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import isExtensionEnabledInjectable from "../../../features/extensions/enabled/common/is-enabled.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  id: "lens-protocol-router-main",

  instantiate: (di) => new LensProtocolRouterMain({
    extensionLoader: di.inject(extensionLoaderInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    showApplicationWindow: di.inject(showApplicationWindowInjectable),
    broadcastMessage: di.inject(broadcastMessageInjectable),
    logger: di.inject(loggerInjectionToken),
  }),
});

export default lensProtocolRouterMainInjectable;
