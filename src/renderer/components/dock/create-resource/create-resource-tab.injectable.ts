/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import { DockTabCreate, DockTabCreateOptions, DockTabCreateSpecific, DockTabData, TabKind } from "../dock/store";
import createDockTabInjectable from "../dock/create-tab.injectable";

interface Dependencies {
  createDockTab: (data: DockTabCreate, opts?: DockTabCreateOptions) => DockTabData;
}

function createResourceTab({ createDockTab }: Dependencies, tabParams: DockTabCreateSpecific = {}) {
  return createDockTab({
    title: "Create resource",
    ...tabParams,
    kind: TabKind.CREATE_RESOURCE,
  }, {
    addNumber: true,
  });
}

const createResourceTabInjectable = getInjectable({
  instantiate: (di) => bind(createResourceTab, null, {
    createDockTab: di.inject(createDockTabInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createResourceTabInjectable;
