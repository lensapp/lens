import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { crdResourcesRoute, crdRoute, crdURL, crdDefinitionsRoute } from "./crd.route";
import { CrdList } from "./crd-list";
import { CrdResources } from "./crd-resources";

// todo: next steps - customization via plugins
// todo: list views (rows content), full details view and if possible chart/prometheus hooks

@observer
export class CustomResources extends React.Component {
  static get tabRoutes(): TabRoute[] {
    return [
      {
        title: <Trans>Definitions</Trans>,
        component: CustomResources,
        url: crdURL(),
        path: crdRoute.path,
      }
    ]
  }

  render() {
    return (
      <MainLayout>
        <Switch>
          <Route component={CrdList} {...crdDefinitionsRoute} exact/>
          <Route component={CrdResources} {...crdResourcesRoute}/>
          <Redirect to={crdURL()}/>
        </Switch>
      </MainLayout>
    );
  }
}