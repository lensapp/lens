import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeDockTabIdStateInjectable from "./active-dock-tab-id-state.injectable";

const activateDockTabInjectable = getInjectable({
  id: "activate-dock-tab",

  instantiate: (di) => {
    const activeDockTabId = di.inject(activeDockTabIdStateInjectable);

    return action((tabId: string) => activeDockTabId.set(tabId));
  },
});

export default activateDockTabInjectable;
