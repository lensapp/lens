import "./cluster-manager.scss"
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { LandingPage, landingRoute, landingURL } from "../+landing-page";
import { Preferences, preferencesRoute } from "../+preferences";
import { Workspaces, workspacesRoute } from "../+workspaces";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { clusterViewRoute, clusterViewURL, getMatchedCluster } from "./cluster-view.route";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { WebviewTag } from "electron";
import { observable, reaction } from "mobx";
import logger from "../../../main/logger";
import { clusterIpc } from "../../../common/cluster-ipc";
import { cssNames } from "../../utils";

// fixme: hide active view on disconnect
// fixme: webview reloading/blinking when switching common <-> cluster views

interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: WebviewTag
}

const lensViews = observable.map<ClusterId, LensView>();

// fixme: figure out how to replace webview-tag to iframe
function initView(clusterId: ClusterId) {
  if (lensViews.has(clusterId)) {
    return;
  }
  logger.info(`[CLUSTER-VIEW]: init dashboard, clusterId=${clusterId}`)
  const lensViewsHolder = document.getElementById("lens-views"); // defined in cluster-manager's css-grid
  const webview = document.createElement("webview");
  webview.setAttribute("src", `//${clusterId}.${location.host}`)
  webview.setAttribute("nodeintegration", "true")
  webview.setAttribute("enableremotemodule", "true")
  webview.addEventListener("did-finish-load", async () => {
    logger.info(`[CLUSTER-VIEW]: loaded, clusterId=${clusterId}`)
    await clusterIpc.init.invokeFromRenderer(clusterId); // push cluster-state to webview and render dashboard
    lensViews.get(clusterId).isLoaded = true;
    refreshViews();
  });
  webview.addEventListener("did-fail-load", (event) => {
    logger.error(`[CLUSTER-VIEW]: failed to load, clusterId=${clusterId}`, event)
  });
  lensViews.set(clusterId, { clusterId, view: webview });
  lensViewsHolder.appendChild(webview); // add to dom and init cluster-page loading
}

function refreshViews() {
  const activeCluster = getMatchedCluster()
  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isVisible = clusterId === activeCluster?.id && activeCluster?.available;
    view.style.display = isLoaded && isVisible ? "flex" : "none"
  })
}

@observer
export class ClusterManager extends React.Component {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(getMatchedCluster, cluster => {
        // auto-refresh visibility for active cluster
        if (cluster) initView(cluster.id);
        refreshViews();
      }, {
        fireImmediately: true
      })
    ])
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
    const cluster = getMatchedCluster();
    return (
      <div className="ClusterManager">
        <div id="draggable-top"/>
        <div id="lens-views" className={cssNames({ active: !!cluster })}/>
        <main>
          <Switch>
            <Route component={LandingPage} {...landingRoute}/>
            <Route component={Preferences} {...preferencesRoute}/>
            <Route component={Workspaces} {...workspacesRoute}/>
            <Route component={AddCluster} {...addClusterRoute}/>
            <Route component={ClusterView} {...clusterViewRoute}/>
            <Redirect exact from="/" to={this.startUrl}/>
          </Switch>
        </main>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
