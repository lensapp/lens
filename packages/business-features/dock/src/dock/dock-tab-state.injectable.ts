import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface DockTabInState {
  id: string;
  typeId: string;
}

export const dockTabStateInjectable = getInjectable({
  id: "dock-tab-state",
  instantiate: () => observable.set<DockTabInState>(),
});
