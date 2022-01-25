/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import dockStoreInjectable from "../dock/store.injectable";
import { DockStore, DockTabCreateSpecific, TabKind } from "../dock/store";

interface Dependencies {
  dockStore: DockStore
}

function createResourceTab({ dockStore }: Dependencies, tabParams: DockTabCreateSpecific = {}) {
  return dockStore.createTab({
    title: "Create resource",
    ...tabParams,
    kind: TabKind.CREATE_RESOURCE,
  });
}

const createResourceTabInjectable = getInjectable({
  instantiate: (di) => bind(createResourceTab, null, {
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createResourceTabInjectable;
