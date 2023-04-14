import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { Tabs } from "./tabs";
import { Div, Map } from "@k8slens/ui-components";
import dockTabsInjectable, { ActivatableDockTab } from "./dock-tabs.injectable";
import type { DockTab } from "../dock-tab";
import activeDockTabInjectable from "./active-dock-tab.injectable";

const NonInjectedDockHost = observer(({ dockTabs, activeDockTab }: Dependencies) => {
  const { ContentComponent: DockTabContent } = activeDockTab.get();

  return (
    <Div>
      <Tabs>
        <Map items={dockTabs.get()}>
          {({ id, TitleComponent, activate }) => (
            <Tabs.Tab data-dock-tab-test={id} onClick={activate}>
              <TitleComponent />
            </Tabs.Tab>
          )}
        </Map>
      </Tabs>

      <Div>
        <DockTabContent />
      </Div>
    </Div>
  );
});

interface Dependencies {
  dockTabs: IComputedValue<ActivatableDockTab[]>;
  activeDockTab: IComputedValue<DockTab>;
}

export const DockHost = withInjectables<Dependencies>(
  NonInjectedDockHost,

  {
    getProps: (di) => ({
      dockTabs: di.inject(dockTabsInjectable),
      activeDockTab: di.inject(activeDockTabInjectable),
    }),
  },
);
