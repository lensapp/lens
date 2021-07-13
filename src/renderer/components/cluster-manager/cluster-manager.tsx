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

import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router";
import { observer } from "mobx-react";
import { GlobalPageRegistry } from "../../../extensions/registries/page-registry";
import * as routes from "../../../common/routes";


const Catalog = lazy(() => import("../+catalog/catalog"));
const ClusterTopbar = lazy(() => import("./cluster-topbar"));
const CatalogTopbar = lazy(() => import("./catalog-topbar"));

const Welcome = lazy(() => import("../+welcome/welcome"));
const Preferences = lazy(() => import("../+preferences/preferences"));
const Extensions = lazy(() => import("../+extensions/extensions"));
const AddCluster = lazy(() => import("../+add-cluster/add-cluster"));
const ClusterView = lazy(() => import("./cluster-view"));
const EntitySettings = lazy(() => import("../+entity-settings/entity-settings"));

const BottomBar = lazy(() => import("./bottom-bar"));
const HotbarMenu = lazy(() => import("../hotbar/hotbar-menu"));

@observer
export class ClusterManager extends React.Component {
  render() {
    return (
      <div className="ClusterManager">
        <Suspense fallback={<div></div>}>
          <Route component={CatalogTopbar} {...routes.catalogRoute} />
          <Route component={ClusterTopbar} {...routes.clusterViewRoute} />
        </Suspense>
        <main>
          <div id="lens-views"/>
          <Suspense fallback={<div></div>}>
            <Switch>
              <Route component={Welcome} {...routes.welcomeRoute} />
              <Route component={Catalog} {...routes.catalogRoute} />
              <Route component={Preferences} {...routes.preferencesRoute} />
              <Route component={Extensions} {...routes.extensionsRoute} />
              <Route component={AddCluster} {...routes.addClusterRoute} />
              <Route component={ClusterView} {...routes.clusterViewRoute} />
              <Route component={EntitySettings} {...routes.entitySettingsRoute} />
              {
                GlobalPageRegistry.getInstance().getItems()
                  .map(({ url, components: { Page } }) => (
                    <Route key={url} path={url} component={Page} />
                  ))
              }
              <Redirect exact to={routes.welcomeURL()} />
            </Switch>
          </Suspense>

        </main>
        <Suspense fallback={<div></div>}>
          <HotbarMenu />
          <BottomBar />
        </Suspense>
      </div>
    );
  }
}

export default ClusterManager;
