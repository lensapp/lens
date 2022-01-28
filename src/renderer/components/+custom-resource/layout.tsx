/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { TabLayout } from "../layout/tab-layout";
import { CrdList } from "./crd-list/crd-list";
import { CrdResources } from "./crd-resources";
import { crdURL, crdDefinitionsRoute, crdResourcesRoute } from "../../../common/routes";

export const CustomResourcesLayout = observer(() => (
  <TabLayout>
    <Switch>
      <Route component={CrdList} {...crdDefinitionsRoute} exact/>
      <Route component={CrdResources} {...crdResourcesRoute}/>
      <Redirect to={crdURL()}/>
    </Switch>
  </TabLayout>
));
