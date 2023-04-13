import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { Tab } from "./tab";
import { Div, Map } from "@k8slens/ui-components";
import dockTabsInjectable from "./dock-tabs.injectable";
import type { DockTab } from "../dock-tab";

const NonInjectedDockHost = observer(({ dockTabs }: Dependencies) => (
  <Div _className={["Dock", { isOpen: true }]}>
    <Div _flexParent={{ centeredVertically: true }} className="tabs-container">
      <Map items={dockTabs.get()}>
        {({ Component }) => (
          <Tab>
            <Div _flexParent={{ centeredVertically: true }}>
              <Component />
            </Div>
          </Tab>
        )}
      </Map>
    </Div>

    <Div
      _flexParent={{ centeredVertically: true }}
      _className={[
        "toolbar gaps box grow",
        {
          "pl-0": true,
        },
      ]}
    >
      <div className="dock-menu box grow"></div>
    </Div>

    <div className={`tab-content`} style={{ flexBasis: 420 }}>
      Some content
    </div>
  </Div>
));

interface Dependencies {
  dockTabs: IComputedValue<DockTab[]>;
}

export const DockHost = withInjectables<Dependencies>(
  NonInjectedDockHost,

  {
    getProps: (di, props) => ({
      dockTabs: di.inject(dockTabsInjectable),
      ...props,
    }),
  },
);
