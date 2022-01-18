/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import { EditResourceStore } from "./edit-resource.store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const editResourceStoreInjectable = getInjectable({
  instantiate: (di) =>
    new EditResourceStore({
      dockStore: di.inject(dockStoreInjectable),
      createStorage: di.inject(createStorageInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default editResourceStoreInjectable;
