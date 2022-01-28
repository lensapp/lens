/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import configRoutesInjectable from "./routes.injectable";
import type { IComputedValue } from "mobx";

export interface ConfigLayoutProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedConfigLayout = observer(({ routes }: Dependencies & ConfigLayoutProps) => (
  <TabLayout
    className="Config"
    tabs={routes.get()}
  />
));

export const ConfigLayout = withInjectables<Dependencies, ConfigLayoutProps>(NonInjectedConfigLayout, {
  getProps: (di, props) => ({
    routes: di.inject(configRoutesInjectable),
    ...props,
  }),
});

