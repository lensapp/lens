import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter, map } from "lodash/fp";
import { computed } from "mobx";
import type { DockTabType } from "../dock-tab-type";
import { dockTabStateInjectable } from "./dock-tab-state.injectable";
import activateDockTabInjectable from "./activate-dock-tab.injectable";
import dockTabTypesInjectable from "./dock-tabs-types.injectable";
import closeDockTabInjectable from "./close-dock-tab.injectable";

export interface DockTabViewModel {
  id: string;
  type: DockTabType;
  activate: () => void;
  close: () => void;
}

const dockTabsInjectable = getInjectable({
  id: "dock-tabs",

  instantiate: (di) => {
    const dockTabTypes = di.inject(dockTabTypesInjectable);
    const dockTabState = di.inject(dockTabStateInjectable);
    const activateDockTab = di.inject(activateDockTabInjectable);
    const closeDockTab = di.inject(closeDockTabInjectable);

    return computed((): DockTabViewModel[] => {
      const dereferencedDockTabTypes = dockTabTypes.get();

      return pipeline(
        [...dockTabState.values()],

        map((tab) => ({
          tab,
          type: dereferencedDockTabTypes.find((type) => type.id === tab.typeId),
        })),

        filter(({ type }) => !!type),

        map(({ tab, type }) => ({
          id: tab.id,
          type: type as DockTabType,
          activate: () => activateDockTab(tab.id),
          close: () => closeDockTab(tab),
        })),
      );
    });
  },
});

export default dockTabsInjectable;
