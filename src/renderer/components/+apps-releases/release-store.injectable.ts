/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ReleaseStore } from "./release.store";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";

const releaseStoreInjectable = getInjectable({
  instantiate: (di) => new ReleaseStore({
    namespaceStore: di.inject(namespaceStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default releaseStoreInjectable;
