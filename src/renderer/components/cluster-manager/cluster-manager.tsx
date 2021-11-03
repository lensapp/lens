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
import { disposeOnUnmount, observer } from "mobx-react";
import { BottomBar } from "./bottom-bar";
import { Catalog, previousActiveTab } from "../+catalog";
import { Preferences } from "../+preferences";
import { AddCluster } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { GlobalPageRegistry } from "../../../extensions/registries/page-registry";
import { Extensions } from "../+extensions";
import { HotbarMenu } from "../hotbar/hotbar-menu";
import { EntitySettings } from "../+entity-settings";
import { Welcome } from "../+welcome";
import * as routes from "../../../common/routes";
import { DeleteClusterDialog } from "../delete-cluster-dialog";
import { reaction } from "mobx";
import { navigation } from "../../navigation";
import { setEntityOnRouteMatch } from "../../../main/catalog-sources/helpers/general-active-sync";
import { TopBar } from "../layout/topbar";
import { catalogURL, getPreviousTabUrl } from "../../../common/routes";

@observer
export class ClusterManager extends React.Component {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => navigation.location, () => setEntityOnRouteMatch(), { fireImmediately: true }),
    ]);
  }

  render() {
    return (
      <div className="ClusterManager">
        <TopBar/>
        <main>
          <div id="lens-views"/>
          <Switch>
            <Redirect exact from={catalogURL()} to={getPreviousTabUrl(previousActiveTab.get())}/>
            <Route component={Welcome} {...routes.welcomeRoute} />
            <Route component={Catalog} {...routes.catalogRoute} />
            <Route component={Preferences} {...routes.preferencesRoute} />
            <Route component={Extensions} {...routes.extensionsRoute} />
            <Route component={AddCluster} {...routes.addClusterRoute} />
            <Route component={ClusterView} {...routes.clusterViewRoute} />
            <Route component={EntitySettings} {...routes.entitySettingsRoute} />
            {
              GlobalPageRegistry.getInstance().getItems()
                .map(({ url, components: { Page }}) => (
                  <Route key={url} path={url} component={Page} />
                ))
            }
            <Redirect exact to={routes.welcomeURL()}/>
          </Switch>
        </main>
        <HotbarMenu/>
        <BottomBar/>
        <DeleteClusterDialog/>
      </div>
    );
  }
}
