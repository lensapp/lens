/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterMain } from "./router";
import extensionsStoreInjectable from "../../extensions/extensions-store/extensions-store.injectable";
import ensureMainWindowInjectable from "../window/ensure-main.injectable";
import lensProtocolRouterLoggerInjectable from "../../common/protocol-handler/logger.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  id: "lens-protocol-router-main",

  instantiate: (di) => new LensProtocolRouterMain({
    extensionLoader: di.inject(extensionLoaderInjectable),
    extensionsStore: di.inject(extensionsStoreInjectable),
    ensureMainWindow: di.inject(ensureMainWindowInjectable),
    logger: di.inject(lensProtocolRouterLoggerInjectable),
  }),
});

export default lensProtocolRouterMainInjectable;
