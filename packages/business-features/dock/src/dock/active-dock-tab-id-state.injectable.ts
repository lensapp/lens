import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const activeDockTabIdStateInjectable = getInjectable({
  id: "active-dock-tab-id",
  instantiate: () => observable.box<string | null>(),
});

export default activeDockTabIdStateInjectable;
