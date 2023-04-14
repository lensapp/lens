import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import activeDockTabIdInjectable from "./active-dock-tab-id.injectable";
import { pipeline } from "@ogre-tools/fp";
import { defaults, find, first } from "lodash/fp";
import type { DockTab } from "../dock-tab";
import dockTabTypesInjectable from "./dock-tabs-types.injectable";

const nullTab: DockTab = {
  id: "no-active-dock-tab",
  TitleComponent: () => null,
  ContentComponent: () => null,
};

const activeDockTabInjectable = getInjectable({
  id: "active-dock-tab",

  instantiate: (di) => {
    const dockTabTypes = di.inject(dockTabTypesInjectable);
    const activeDockTabId = di.inject(activeDockTabIdInjectable);

    return computed(() => {
      const tabs = dockTabTypes.get();

      return pipeline(
        tabs,
        find((tab) => tab.id === activeDockTabId.get()),
        defaults(first(tabs)),
        defaults(nullTab),
      );
    });
  },
});

export default activeDockTabInjectable;
