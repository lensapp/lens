/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createResourceTab } from "./create-resource-tab";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const createResourceTabInjectable = getInjectable({
  instantiate: (di) => createResourceTab({
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createResourceTabInjectable;
