import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { DockTab } from "../dock-tab";
import activateDockTabInjectable from "./activate-dock-tab.injectable";
import dockTabTypesInjectable from "./dock-tabs-types.injectable";

type Activatable = { activate: () => void };

export type ActivatableDockTab = DockTab & Activatable;

const dockTabsInjectable = getInjectable({
  id: "dock-tabs",

  instantiate: (di) => {
    const dockTabTypes = di.inject(dockTabTypesInjectable);
    const activateFor = di.injectFactory(activateDockTabInjectable);

    return computed(() =>
      dockTabTypes.get().map((tab) => ({
        ...tab,

        activate: activateFor(tab.id),
      })),
    );
  },
});

export default dockTabsInjectable;
