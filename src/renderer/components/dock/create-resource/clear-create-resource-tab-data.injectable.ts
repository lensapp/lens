/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import createResourceTabStoreInjectable from "./store.injectable";

const clearCreateResourceTabDataInjectable = getInjectable({
  id: "clear-create-resource-tab-data",

  instantiate: (di) => {
    const createResourceTabStore = di.inject(createResourceTabStoreInjectable);

    return (tabId: TabId): void => {
      createResourceTabStore.clearData(tabId);
    };
  },
});

export default clearCreateResourceTabDataInjectable;
