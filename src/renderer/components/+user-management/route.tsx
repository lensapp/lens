/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./user-management.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import userManagementRouteTabsInjectable from "./route-tabs.injectable";

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedUserManagementRoute = observer(({ routes }: Dependencies) => (
  <TabLayout
    className="UserManagement"
    tabs={routes.get()}
  />
));

export const UserManagementRoute = withInjectables<Dependencies>(NonInjectedUserManagementRoute, {
  getProps: (di, props) => ({
    routes: di.inject(userManagementRouteTabsInjectable),
    ...props,
  }),
});
