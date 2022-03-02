/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import helmRoutesInjectable from "./route-tabs.injectable";

export interface HelmRouteProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedHelmRoute = observer(({ routes }: Dependencies & HelmRouteProps) => (
  <TabLayout
    className="Apps"
    tabs={routes.get()}
  />
));

export const HelmRoute = withInjectables<Dependencies, HelmRouteProps>(NonInjectedHelmRoute, {
  getProps: (di, props) => ({
    routes: di.inject(helmRoutesInjectable),
    ...props,
  }),
});
