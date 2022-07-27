/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import editResourceTabStoreInjectable from "./store.injectable";
import dockStoreInjectable from "../dock/store.injectable";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import type { DockTabCreateSpecific, TabId } from "../dock/store";
import { TabKind } from "../dock/store";
import { runInAction } from "mobx";
import getRandomIdForEditResourceTabInjectable from "./get-random-id-for-edit-resource-tab.injectable";

const createEditResourceTabInjectable = getInjectable({
  id: "create-edit-resource-tab",

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);
    const editResourceStore = di.inject(editResourceTabStoreInjectable);
    const getRandomId = di.inject(getRandomIdForEditResourceTabInjectable);

    return (
      object: KubeObject,
      tabParams: DockTabCreateSpecific = {},
    ): TabId => {
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
            id: getRandomId(),
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
  },
});

export default createEditResourceTabInjectable;
