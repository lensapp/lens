/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import workloadRoutesInjectable from "./routes.injectable";

export interface WorkloadsLayoutProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedWorkloadsLayout = observer(({ routes }: Dependencies & WorkloadsLayoutProps) => (
  <TabLayout
    className="Workloads"
    tabs={routes.get()}
  />
));

export const WorkloadsLayout = withInjectables<Dependencies, WorkloadsLayoutProps>(NonInjectedWorkloadsLayout, {
  getProps: (di, props) => ({
    routes: di.inject(workloadRoutesInjectable),
    ...props,
  }),
});
