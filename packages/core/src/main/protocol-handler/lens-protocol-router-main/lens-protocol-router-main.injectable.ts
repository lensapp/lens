/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterMain } from "./lens-protocol-router-main";
import enabledExtensionsStateInjectable from "../../../extensions/enabled-extensions-state.injectable";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  id: "lens-protocol-router-main",

  instantiate: (di) =>
    new LensProtocolRouterMain({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionsStore: di.inject(enabledExtensionsStateInjectable),
      showApplicationWindow: di.inject(showApplicationWindowInjectable),
      broadcastMessage: di.inject(broadcastMessageInjectable),
      logger: di.inject(loggerInjectable),
    }),
});

export default lensProtocolRouterMainInjectable;
