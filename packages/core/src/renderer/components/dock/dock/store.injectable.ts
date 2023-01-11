/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { DockStore, TabKind } from "./store";
import dockStorageInjectable from "./dock-storage.injectable";
import clearLogTabDataInjectable from "../logs/clear-log-tab-data.injectable";
import clearUpgradeChartTabDataInjectable from "../upgrade-chart/clear-upgrade-chart-tab-data.injectable";
import clearCreateResourceTabDataInjectable from "../create-resource/clear-create-resource-tab-data.injectable";
import clearEditResourceTabDataInjectable from "../edit-resource/clear-edit-resource-tab-data.injectable";
import clearTerminalTabDataInjectable from "../terminal/clear-terminal-tab-data.injectable";
import clearInstallChartTabDataInjectable from "../install-chart/clear-install-chart-tab-data.injectable";
import isLogsTabDataValidInjectable from "../logs/is-logs-tab-data-valid.injectable";

const dockStoreInjectable = getInjectable({
  id: "dock-store",

  instantiate: (di) => new DockStore({
    storage: di.inject(dockStorageInjectable),
    tabDataClearers: {
      [TabKind.POD_LOGS]: di.inject(clearLogTabDataInjectable),
      [TabKind.UPGRADE_CHART]: di.inject(clearUpgradeChartTabDataInjectable),
      [TabKind.CREATE_RESOURCE]: di.inject(clearCreateResourceTabDataInjectable),
      [TabKind.EDIT_RESOURCE]: di.inject(clearEditResourceTabDataInjectable),
      [TabKind.INSTALL_CHART]: di.inject(clearInstallChartTabDataInjectable),
      [TabKind.TERMINAL]: di.inject(clearTerminalTabDataInjectable),
    },
    tabDataValidator: {
      [TabKind.POD_LOGS]: di.inject(isLogsTabDataValidInjectable),
    },
  }),
});

export default dockStoreInjectable;
