import "./cluster-manager.scss"
import React from "react";
import { observer } from "mobx-react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { cssNames, IClassName } from "../../utils";
import { ClusterId } from "../../../common/cluster-store";
import { Route, Switch } from "react-router";
import { LandingPage, landingRoute } from "../+landing-page";
import { Preferences, preferencesRoute } from "../+preferences";
import { Workspaces, workspacesRoute } from "../+workspaces";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterStatus } from "./cluster-status";
import { clusterStatusRoute } from "./cluster-status.route";

interface Props {
  className?: IClassName;
  contentClass?: IClassName;
}

@observer
export class ClusterManager extends React.Component<Props> {
  activateView(clusterId: ClusterId) {
  }

  render() {
    const { className } = this.props;
    return (
      <div className={cssNames("ClusterManager", className)}>
        <div id="draggable-top"/>
        <div id="lens-view">
          <Switch>
            <Route component={LandingPage} {...landingRoute}/>
            <Route component={Preferences} {...preferencesRoute}/>
            <Route component={Workspaces} {...workspacesRoute}/>
            <Route component={AddCluster} {...addClusterRoute}/>
            <Route component={ClusterStatus} {...clusterStatusRoute}/>
            <Route render={() => <p>Lens</p>}/>
          </Switch>
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
