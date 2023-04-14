import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import dockTabsInjectable from "./dock-tabs.injectable";

const activeDockTabInjectable = getInjectable({
  id: "active-dock-tab",

  instantiate: (di) => {
    const dockTabs = di.inject(dockTabsInjectable);

    return computed(() => {
      const [
        activeDockTab = {
          id: "no-active-dock-tab",
          TitleComponent: () => null,
          ContentComponent: () => null,
        },
      ] = dockTabs.get();

      return activeDockTab;
    });
  },
});

export default activeDockTabInjectable;
