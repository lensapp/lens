/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { DockTabCreate, DockTabCreateOptions, DockTabCreateSpecific, DockTabData, TabKind } from "../dock/store";
import { bind } from "../../../utils";
import createDockTabInjectable from "../dock/create-tab.injectable";

interface Dependencies {
  createDockTab: (data: DockTabCreate, opts?: DockTabCreateOptions) => DockTabData;
}

export function createTerminalTab({ createDockTab }: Dependencies, tabParams: DockTabCreateSpecific = {}) {
  return createDockTab({
    title: "Terminal",
    ...tabParams,
    kind: TabKind.TERMINAL,
  });
}

const createTerminalTabInjectable = getInjectable({
  instantiate: (di) => bind(createTerminalTab, null, {
    createDockTab: di.inject(createDockTabInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalTabInjectable;
