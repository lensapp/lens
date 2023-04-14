import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { action } from "mobx";
import activeDockTabIdInjectable from "./active-dock-tab-id.injectable";

const activateDockTabInjectable = getInjectable({
  id: "activate-dock-tab",

  instantiate: (di, tabId) => {
    const activeDockTabId = di.inject(activeDockTabIdInjectable);

    return action(() => activeDockTabId.set(tabId));
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default activateDockTabInjectable;
