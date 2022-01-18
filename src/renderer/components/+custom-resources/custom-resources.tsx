/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { CrdList } from "./crd-list";
import { CrdResources } from "./crd-resources";
import { crdURL, crdDefinitionsRoute, crdResourcesRoute } from "../../../common/routes";

@observer
export class CustomResources extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    return [
      {
        title: "Definitions",
        component: CustomResources,
        url: crdURL(),
        routePath: String(crdDefinitionsRoute.path),
      },
    ];
  }

  render() {
    return (
      <TabLayout>
        <Switch>
          <Route component={CrdList} {...crdDefinitionsRoute} exact/>
          <Route component={CrdResources} {...crdResourcesRoute}/>
          <Redirect to={crdURL()}/>
        </Switch>
      </TabLayout>
    );
  }
}
