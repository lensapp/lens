import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "./store";
import dockStoreInjectable from "./store.injectable";

const selectDockTabInjectable = getInjectable({
  id: "select-dock-tab",

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (tabId: TabId): void => {
      dockStore.selectTab(tabId);
    };
  },
});

export default selectDockTabInjectable;
