import { getInjectable } from "@ogre-tools/injectable";
import { DockTabInState, dockTabStateInjectable } from "./dock-tab-state.injectable";
import activateDockTabInjectable from "./activate-dock-tab.injectable";
import { action } from "mobx";

const closeDockTabInjectable = getInjectable({
  id: "close-dock-tab",

  instantiate: (di) => {
    const dockTabState = di.inject(dockTabStateInjectable);
    const activateDockTab = di.inject(activateDockTabInjectable);

    return action((tabToBeClosed: DockTabInState) => {
      const currentTabs = [...dockTabState.values()];
      const currentIndex = currentTabs.indexOf(tabToBeClosed);

      const previousIndex = currentIndex - 1;

      const tabToBeActivated = currentTabs.at(previousIndex);

      dockTabState.delete(tabToBeClosed);

      console.log(previousIndex, currentTabs); // TODO: Fix

      if (tabToBeActivated) {
        activateDockTab(tabToBeActivated.id);
      }
    });
  },
});

export default closeDockTabInjectable;
