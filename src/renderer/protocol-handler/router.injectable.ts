/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterRenderer } from "./router";
import extensionsStoreInjectable from "../../extensions/extensions-store/extensions-store.injectable";
import lensProtocolRouterLoggerInjectable from "../../common/protocol-handler/logger.injectable";

const lensProtocolRouterRendererInjectable = getInjectable({
  id: "lens-protocol-router-renderer",

  instantiate: (di) => new LensProtocolRouterRenderer({
    extensionLoader: di.inject(extensionLoaderInjectable),
    extensionsStore: di.inject(extensionsStoreInjectable),
    logger: di.inject(lensProtocolRouterLoggerInjectable),
  }),
});

export default lensProtocolRouterRendererInjectable;
