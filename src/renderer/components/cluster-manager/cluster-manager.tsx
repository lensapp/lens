import "./cluster-manager.scss"
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { observer } from "mobx-react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { LandingPage, landingRoute, landingURL } from "../+landing-page";
import { Preferences, preferencesRoute } from "../+preferences";
import { Workspaces, workspacesRoute } from "../+workspaces";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { clusterViewRoute, clusterViewURL } from "./cluster-view.route";
import { clusterStore } from "../../../common/cluster-store";

@observer
export class ClusterManager extends React.Component {
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
        <div id="lens-view">
          <Switch>
            <Route component={LandingPage} {...landingRoute}/>
            <Route component={Preferences} {...preferencesRoute}/>
            <Route component={Workspaces} {...workspacesRoute}/>
            <Route component={AddCluster} {...addClusterRoute}/>
            <Route component={ClusterView} {...clusterViewRoute}/>
            <Redirect exact from="/" to={this.startUrl}/>
          </Switch>
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
