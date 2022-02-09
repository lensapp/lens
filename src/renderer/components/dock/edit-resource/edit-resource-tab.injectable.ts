/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import editResourceTabStoreInjectable from "./store.injectable";
import dockStoreInjectable from "../dock/store.injectable";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import { DockStore, DockTabCreateSpecific, TabId, TabKind } from "../dock/store";
import type { EditResourceTabStore } from "./store";
import { runInAction } from "mobx";

interface Dependencies {
  dockStore: DockStore;
  editResourceStore: EditResourceTabStore;
}

const createEditResourceTab = ({ dockStore, editResourceStore }: Dependencies) => (object: KubeObject, tabParams: DockTabCreateSpecific = {}): TabId => {
  // use existing tab if already opened
  const tabId = editResourceStore.getTabIdByResource(object);

  if (tabId) {
    dockStore.open();
    dockStore.selectTab(tabId);

    return tabId;
  }

  return runInAction(() => {
    const tab = dockStore.createTab(
      {
        title: `${object.kind}: ${object.getName()}`,
        ...tabParams,
        kind: TabKind.EDIT_RESOURCE,
      },
      false,
    );

    editResourceStore.setData(tab.id, {
      resource: object.selfLink,
    });

    return tab.id;
  });
};

const createEditResourceTabInjectable = getInjectable({
  id: "create-edit-resource-tab",

  instantiate: (di) => createEditResourceTab({
    dockStore: di.inject(dockStoreInjectable),
    editResourceStore: di.inject(editResourceTabStoreInjectable),
  }),
});

export default createEditResourceTabInjectable;
