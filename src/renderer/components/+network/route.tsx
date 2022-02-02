/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./network.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import networkRouteTabsInjectable from "./route-tabs.injectable";

export interface NetworksRouteProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedNetworksRoute = observer(({ routes }: Dependencies & NetworksRouteProps) => (
  <TabLayout
    className="Network"
    tabs={routes.get()}
  />
));

export const NetworkRoute = withInjectables<Dependencies, NetworksRouteProps>(NonInjectedNetworksRoute, {
  getProps: (di, props) => ({
    routes: di.inject(networkRouteTabsInjectable),
    ...props,
  }),
});
