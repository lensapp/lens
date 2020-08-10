import "./cluster-manager.scss"
import React from "react";
import { WebviewTag } from "electron";
import { Redirect, Route, Switch } from "react-router";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { clusterIpc } from "../../../common/cluster-ipc";
import { cssNames } from "../../utils";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { LandingPage, landingRoute, landingURL } from "../+landing-page";
import { Preferences, preferencesRoute } from "../+preferences";
import { Workspaces, workspacesRoute } from "../+workspaces";
import { AddCluster, addClusterRoute } from "../+add-cluster";
import { ClusterView } from "./cluster-view";
import { clusterViewRoute, clusterViewURL, getMatchedCluster, getMatchedClusterId } from "./cluster-view.route";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import logger from "../../../main/logger";

interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: WebviewTag
}

const lensViews = observable.map<ClusterId, LensView>();

export function hasLoadedView(clusterId: ClusterId): boolean {
  return !!lensViews.get(clusterId)?.isLoaded;
}

// todo: figure out how to replace <webview>-tag to <iframe> with nodeIntegration=true
function initView(clusterId: ClusterId) {
  if (!clusterId || lensViews.has(clusterId)) {
    return;
  }
  logger.info(`[CLUSTER-VIEW]: init dashboard, clusterId=${clusterId}`)
  const parentElem = document.getElementById("lens-views"); // defined in cluster-manager's css-grid
  const webview = document.createElement("webview");
  webview.setAttribute("src", `//${clusterId}.${location.host}`)
  webview.setAttribute("nodeintegration", "true")
  webview.setAttribute("enableremotemodule", "true")
  webview.addEventListener("did-finish-load", () => {
    logger.info(`[CLUSTER-VIEW]: loaded, clusterId=${clusterId}`)
    clusterIpc.init.invokeFromRenderer(clusterId); // push cluster-state to webview and init render
    lensViews.get(clusterId).isLoaded = true;
    refreshViews();
  });
  webview.addEventListener("did-fail-load", (event) => {
    logger.error(`[CLUSTER-VIEW]: failed to load, clusterId=${clusterId}`, event)
  });
  lensViews.set(clusterId, { clusterId, view: webview });
  parentElem.appendChild(webview); // add to dom and init cluster-page loading
}

function refreshViews() {
  const cluster = getMatchedCluster()
  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isVisible = cluster && cluster.available && cluster.id === clusterId;
    view.style.display = isLoaded && isVisible ? "flex" : "none"
  })
}

@observer
export class ClusterManager extends React.Component {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(getMatchedClusterId, initView, {
        fireImmediately: true
      }),
      reaction(() => [
        getMatchedClusterId(),
        getMatchedCluster()?.available,
      ], refreshViews, {
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
            <Redirect exact to={this.startUrl}/>
          </Switch>
        </main>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
