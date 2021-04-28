import "./cluster-manager.scss";

import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { observer } from "mobx-react";
import { BottomBar } from "./bottom-bar";
import { Catalog, catalogRoute } from "../+catalog";
import { Preferences, preferencesRoute } from "../+preferences";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { clusterViewRoute } from "./cluster-view.route";
import { globalPageRegistry } from "../../../extensions/registries/page-registry";
import { Extensions, extensionsRoute } from "../+extensions";
import { HotbarMenu } from "../hotbar/hotbar-menu";
import { EntitySettings, entitySettingsRoute } from "../+entity-settings";
import { Welcome, welcomeRoute, welcomeURL } from "../+welcome";

@observer
export class ClusterManager extends React.Component {
  render() {
    return (
      <div className="ClusterManager">
        <main>
          <div id="lens-views"/>
          <Switch>
            <Route component={Welcome} {...welcomeRoute} />
            <Route component={Catalog} {...catalogRoute} />
            <Route component={Preferences} {...preferencesRoute} />
            <Route component={Extensions} {...extensionsRoute} />
            <Route component={AddCluster} {...addClusterRoute} />
            <Route component={ClusterView} {...clusterViewRoute} />
            <Route component={EntitySettings} {...entitySettingsRoute} />
            {
              globalPageRegistry.getItems()
                .map(({ url, components: { Page } }) => (
                  <Route key={url} path={url} component={Page} />
                ))
            }
            <Redirect exact to={welcomeURL()}/>
          </Switch>
        </main>
        <HotbarMenu/>
        <BottomBar/>
      </div>
    );
  }
}
