/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { TabLayout } from "../layout/tab-layout";
import { crdURL } from "../../../common/routes";
import type { IComputedValue } from "mobx";
import type { CustomResourceGroupTabLayoutRoute } from "./route-tabs.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import customResourcesRouteTabsInjectable from "./route-tabs.injectable";

interface Dependencies {
  routes: IComputedValue<CustomResourceGroupTabLayoutRoute[]>;
}

const NonInjectedCustomResourcesRoute = observer(({ routes }: Dependencies) => (
  <TabLayout>
    <Switch>
      {
        routes.get().map(({ id, component, routePath, exact }) => (
          <Route
            key={id}
            component={component}
            path={routePath}
            exact={exact}
          />
        ))
      }
      <Redirect to={crdURL()}/>
    </Switch>
  </TabLayout>
));

export const CustomResourcesRoute = withInjectables<Dependencies>(NonInjectedCustomResourcesRoute, {
  getProps: (di, props) => ({
    routes: di.inject(customResourcesRouteTabsInjectable),
    ...props,
  }),
});
