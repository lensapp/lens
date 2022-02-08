/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./storage.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import storageRouteTabsInjectable from "./route-tabs.injectable";

export interface StorageRouteProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedStorageRoute = observer(({ routes }: Dependencies & StorageRouteProps) => (
  <TabLayout
    className="Storage"
    tabs={routes.get()}
  />
));

export const StorageRoute = withInjectables<Dependencies, StorageRouteProps>(NonInjectedStorageRoute, {
  getProps: (di, props) => ({
    routes: di.inject(storageRouteTabsInjectable),
    ...props,
  }),
});

