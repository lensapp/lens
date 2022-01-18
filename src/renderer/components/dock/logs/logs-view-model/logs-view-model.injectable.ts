/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "../../dock-store/dock-store.injectable";
import logTabStoreInjectable from "../../log-tab-store/log-tab-store.injectable";
import reloadedLogStoreInjectable from "../../log-store/reloaded-log-store.injectable";
import { LogsViewModel } from "./logs-view-model";

const logsViewModelInjectable = getInjectable({
  instantiate: async (di) => new LogsViewModel({
    dockStore: di.inject(dockStoreInjectable),
    logTabStore: di.inject(logTabStoreInjectable),
    logStore: await di.inject(reloadedLogStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default logsViewModelInjectable;
