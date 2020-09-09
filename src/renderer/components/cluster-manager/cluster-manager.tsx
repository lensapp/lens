import "./cluster-manager.scss"
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { LandingPage, landingRoute, landingURL } from "../+landing-page";
import { Preferences, preferencesRoute } from "../+preferences";
import { Workspaces, workspacesRoute } from "../+workspaces";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { ClusterSettings, clusterSettingsRoute } from "../+cluster-settings";
import { Extensions, extensionsRoute } from "../+extensions";
import { clusterViewRoute, clusterViewURL, getMatchedCluster, getMatchedClusterId } from "./cluster-view.route";
import { clusterStore } from "../../../common/cluster-store";
import { hasLoadedView, initView, lensViews, refreshViews } from "./lens-views";

@observer
export class ClusterManager extends React.Component {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(getMatchedClusterId, initView, {
        fireImmediately: true
      }),
      reaction(() => [
        hasLoadedView(getMatchedClusterId()), // refresh when cluster's webview loaded
        getMatchedCluster()?.available, // refresh on disconnect active-cluster
      ], refreshViews, {
        fireImmediately: true
      })
    ])
  }

  componentWillUnmount() {
    lensViews.clear();
  }

  get startUrl() {
    const { activeClusterId } = clusterStore;
    if (activeClusterId) {
      return clusterViewURL({
        params: {
          clusterId: activeClusterId
        }
      })
    }
    return landingURL()
  }

  render() {
    return (
      <div className="ClusterManager">
        <div id="draggable-top"/>
        <main>
          <div id="lens-views"/>
          <Switch>
            <Route component={LandingPage} {...landingRoute}/>
            <Route component={Preferences} {...preferencesRoute}/>
            <Route component={Workspaces} {...workspacesRoute}/>
            <Route component={AddCluster} {...addClusterRoute}/>
            <Route component={ClusterView} {...clusterViewRoute}/>
            <Route component={ClusterSettings} {...clusterSettingsRoute}/>
            <Route component={Extensions} {...extensionsRoute}/>
            <Redirect exact to={this.startUrl}/>
          </Switch>
        </main>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
