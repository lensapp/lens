/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { TabLayout } from "../layout/tab-layout";
import { crdDefinitionsRoute, crdResourcesRoute, crdURL } from "../../../common/routes";
import { CrdList, CrdResources } from ".";

export const CustomResourcesRoute = () => (
  <TabLayout>
    <Switch>
      <Route component={CrdList} {...crdDefinitionsRoute} exact/>
      <Route component={CrdResources} {...crdResourcesRoute}/>
      <Redirect to={crdURL()}/>
    </Switch>
  </TabLayout>
);

