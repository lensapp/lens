/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import userManagementRoutesInjectable from "./routes.injectable";

export interface UserManagementLayoutProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedUserManagementLayout = observer(({ routes }: Dependencies & UserManagementLayoutProps) => (
  <TabLayout
    className="UserManagement"
    tabs={routes.get()}
  />
));

export const UserManagementLayout = withInjectables<Dependencies, UserManagementLayoutProps>(NonInjectedUserManagementLayout, {
  getProps: (di, props) => ({
    routes: di.inject(userManagementRoutesInjectable),
    ...props,
  }),
});
