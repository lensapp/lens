/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import { DockStore, DockTabCreateSpecific, TabKind } from "../dock-store/dock.store";
import type { EditResourceStore } from "../edit-resource-store/edit-resource.store";

interface Dependencies {
  dockStore: DockStore;
  editResourceStore: EditResourceStore;
}

export const editResourceTab =
  ({ dockStore, editResourceStore }: Dependencies) =>
    (object: KubeObject, tabParams: DockTabCreateSpecific = {}) => {
    // use existing tab if already opened
      let tab = editResourceStore.getTabByResource(object);

      if (tab) {
        dockStore.open();
        dockStore.selectTab(tab.id);
      }

      // or create new tab
      if (!tab) {
        tab = dockStore.createTab(
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
      }

      return tab;
    };
