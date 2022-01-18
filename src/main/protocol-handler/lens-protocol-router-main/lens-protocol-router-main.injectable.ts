/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import { LensProtocolRouterMain } from "./lens-protocol-router-main";
import extensionsStoreInjectable from "../../../extensions/extensions-store/extensions-store.injectable";

const lensProtocolRouterMainInjectable = getInjectable({
  instantiate: (di) =>
    new LensProtocolRouterMain({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionsStore: di.inject(extensionsStoreInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default lensProtocolRouterMainInjectable;
