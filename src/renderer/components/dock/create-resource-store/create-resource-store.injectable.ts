/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import { CreateResourceStore } from "./create-resource.store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const createResourceStoreInjectable = getInjectable({
  instantiate: (di) => new CreateResourceStore({
    dockStore: di.inject(dockStoreInjectable),
    createStorage: di.inject(createStorageInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createResourceStoreInjectable;
