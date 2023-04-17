import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { DockTabType } from "../dock-tab-type";
import { dockTabStateInjectable } from "./dock-tab-state.injectable";
import { getRandomIdInjectionToken } from "./get-random-id.injectable";
import activateDockTabInjectable from "./activate-dock-tab.injectable";

export interface CreateDockTabParams {
  type: DockTabType;
}

export type CreateDockTab = ({ type }: CreateDockTabParams) => void;

export const createDockTabInjectionToken = getInjectionToken<CreateDockTab>({
  id: "create-dock-tab-injection-token",
});

const createDockTabInjectable = getInjectable({
  id: "create-dock-tab",

  instantiate: (di) => {
    const dockTabState = di.inject(dockTabStateInjectable);
    const getRandomId = di.inject(getRandomIdInjectionToken);
    const activateDockTab = di.inject(activateDockTabInjectable);

    return ({ type }) => {
      runInAction(() => {
        const newTabId = getRandomId();

        dockTabState.add({
          id: newTabId,
          typeId: type.id,
        });

        activateDockTab(newTabId);
      });
    };
  },

  injectionToken: createDockTabInjectionToken,
});

export default createDockTabInjectable;
