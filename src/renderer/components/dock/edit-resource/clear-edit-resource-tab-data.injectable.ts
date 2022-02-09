/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import editResourceTabStoreInjectable from "./store.injectable";

const clearEditResourceTabDataInjectable = getInjectable({
  id: "clear-edit-resource-tab",

  instantiate: (di) => {
    const editResourceTabStore = di.inject(editResourceTabStoreInjectable);

    return (tabId: TabId) => {
      editResourceTabStore.clearData(tabId);
    };
  },
});

export default clearEditResourceTabDataInjectable;
