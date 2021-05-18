/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
