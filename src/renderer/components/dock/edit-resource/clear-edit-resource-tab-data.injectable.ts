/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { EditResourceTabStore } from "./store";
import editResourceTabStoreInjectable from "./store.injectable";

interface Dependencies {
  editResourceTabStore: EditResourceTabStore;
}

function clearEditResourceTabData({ editResourceTabStore }: Dependencies, tabId: TabId) {
  editResourceTabStore.clearData(tabId);
}

const clearEditResourceTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearEditResourceTabData, null, {
    editResourceTabStore: di.inject(editResourceTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearEditResourceTabDataInjectable;
