import { getInjectable } from "@ogre-tools/injectable";
import dockStoreInjectable from "./store.injectable";
import type { TabId } from "./store";

const renameTabInjectable = getInjectable({
  id: "rename-tab",

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (tabId: TabId, title: string): void => {
      dockStore.renameTab(tabId, title);
    };
  },
});

export default renameTabInjectable;
