/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import storageRoutesInjectable from "./routes.injectable";

export interface StorageLayoutProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedStorageLayout = observer(({ routes }: Dependencies & StorageLayoutProps) => (
  <TabLayout
    className="Storage"
    tabs={routes.get()}
  />
));

export const StorageLayout = withInjectables<Dependencies, StorageLayoutProps>(NonInjectedStorageLayout, {
  getProps: (di, props) => ({
    routes: di.inject(storageRoutesInjectable),
    ...props,
  }),
});
