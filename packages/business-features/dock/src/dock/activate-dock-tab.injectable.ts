import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeDockTabIdInjectable from "./active-dock-tab-id.injectable";

const activateDockTabInjectable = getInjectable({
  id: "activate-dock-tab",

  instantiate: (di) => {
    const activeDockTabId = di.inject(activeDockTabIdInjectable);

    return action((tabId: string) => activeDockTabId.set(tabId));
  },
});

export default activateDockTabInjectable;
