/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import configRoutesInjectable from "./route-tabs.injectable";

export interface ConfigRouteProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedConfigRoute = observer(({ routes }: Dependencies & ConfigRouteProps) => (
  <TabLayout
    className="Config"
    tabs={routes.get()}
  />
));

export const ConfigRoute = withInjectables<Dependencies, ConfigRouteProps>(NonInjectedConfigRoute, {
  getProps: (di, props) => ({
    routes: di.inject(configRoutesInjectable),
    ...props,
  }),
});
