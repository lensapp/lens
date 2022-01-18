/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { editResourceTab } from "./edit-resource-tab";
import editResourceStoreInjectable from "../edit-resource-store/edit-resource-store.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const editResourceTabInjectable = getInjectable({
  instantiate: (di) => editResourceTab({
    dockStore: di.inject(dockStoreInjectable),
    editResourceStore: di.inject(editResourceStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default editResourceTabInjectable;
