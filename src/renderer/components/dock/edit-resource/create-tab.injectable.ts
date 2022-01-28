/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import { bind } from "../../../utils";
import createDockTabInjectable from "../dock/create-tab.injectable";
import selectDockTabInjectable from "../dock/select-tab.injectable";
import { DockTabCreate, DockTabCreateOptions, DockTabCreateSpecific, DockTabData, TabId, TabKind } from "../dock/store";
import type { EditResourceTabStore } from "./store";
import editResourceTabStoreInjectable from "./store.injectable";

interface Dependencies {
  editResourceTabStore: EditResourceTabStore;
  selectDockTab: (tabId: TabId) => boolean;
  createDockTab: (data: DockTabCreate, opts?: DockTabCreateOptions) => DockTabData;
}

function createEditResourceTab({ editResourceTabStore, selectDockTab, createDockTab }: Dependencies, object: KubeObject, tabParams: DockTabCreateSpecific = {}) {
  const tabId = editResourceTabStore.getTabIdByResource(object);

  if (tabId) {
    if (selectDockTab(tabId)) {
      return tabId;
    } else {
      // somehow `editResourceTabStore` thinks there is a tab for `object` but it doesn't actually exist
      editResourceTabStore.clearData(tabId);
    }
  }

  return runInAction(() => {
    const tab = createDockTab({
      title: `${object.kind}: ${object.getName()}`,
      ...tabParams,
      kind: TabKind.EDIT_RESOURCE,
    });

    editResourceTabStore.setData(tab.id, {
      resource: object.selfLink,
    });

    return tab.id;
  });
}

const newEditResourceTabInjectable = getInjectable({
  instantiate: di => bind(createEditResourceTab, null, {
    editResourceTabStore: di.inject(editResourceTabStoreInjectable),
    selectDockTab: di.inject(selectDockTabInjectable),
    createDockTab: di.inject(createDockTabInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default newEditResourceTabInjectable;
