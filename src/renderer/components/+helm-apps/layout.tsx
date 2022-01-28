/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import helmAppRoutesInjectable from "./routes.injectable";

export interface AppsLayoutProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedAppsLayout = observer(({ routes }: Dependencies & AppsLayoutProps) => (
  <TabLayout
    className="HelmApps"
    tabs={routes.get()}
  />
));

export const HelmAppsLayout = withInjectables<Dependencies, AppsLayoutProps>(NonInjectedAppsLayout, {
  getProps: (di, props) => ({
    routes: di.inject(helmAppRoutesInjectable),
    ...props,
  }),
});

