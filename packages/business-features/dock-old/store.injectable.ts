import { getInjectable } from "@ogre-tools/injectable";
import { DockStore } from "./store";
import dockStorageInjectable from "./dock-storage.injectable";

const dockStoreInjectable = getInjectable({
  id: "dock-store",

  instantiate: (di) =>
    new DockStore({
      storage: di.inject(dockStorageInjectable),
      tabDataClearers: {
        // [TabKind.POD_LOGS]: di.inject(clearLogTabDataInjectable),
        // [TabKind.UPGRADE_CHART]: di.inject(clearUpgradeChartTabDataInjectable),
        // [TabKind.CREATE_RESOURCE]: di.inject(clearCreateResourceTabDataInjectable),
        // [TabKind.EDIT_RESOURCE]: di.inject(clearEditResourceTabDataInjectable),
        // [TabKind.INSTALL_CHART]: di.inject(clearInstallChartTabDataInjectable),
        // [TabKind.TERMINAL]: di.inject(clearTerminalTabDataInjectable),
      },
      tabDataValidator: {
        // [TabKind.POD_LOGS]: di.inject(isLogsTabDataValidInjectable),
      },
    }),
});

export default dockStoreInjectable;
