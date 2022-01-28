/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterMain } from "./router";
import extensionsStoreInjectable from "../../extensions/extensions-store/extensions-store.injectable";
import ensureMainWindowInjectable from "../windows/ensure-main-window.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  instantiate: (di) =>
    new LensProtocolRouterMain({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionsStore: di.inject(extensionsStoreInjectable),
      ensureMainWindow: di.inject(ensureMainWindowInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default lensProtocolRouterMainInjectable;
