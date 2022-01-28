/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { CreateResourceTabStore } from "./store";
import createResourceTabStoreInjectable from "./store.injectable";

interface Dependencies {
  createResourceTabStore: CreateResourceTabStore;
}

function clearCreateResourceTabData({ createResourceTabStore }: Dependencies, tabId: TabId): void {
  createResourceTabStore.clearData(tabId);
}

const clearCreateResourceTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearCreateResourceTabData, null, {
    createResourceTabStore: di.inject(createResourceTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearCreateResourceTabDataInjectable;
