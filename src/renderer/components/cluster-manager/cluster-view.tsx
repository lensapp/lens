import "./cluster-view.scss"
import React from "react";
import { WebviewTag } from "electron";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedClusterId } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import { clusterIpc } from "../../../common/cluster-ipc";
import logger from "../../../main/logger";

// fixme: hide active view on disconnect
// fixme: webview reloading/blinking when switching common <-> cluster views

interface LensView {
  clusterId: ClusterId;
  webview: WebviewTag
  isLoaded?: boolean
}

const lensViews = observable.map<ClusterId, LensView>()
const lensViewsHolder = document.createElement("div")
lensViewsHolder.id = "lens-views"
document.body.appendChild(lensViewsHolder);

@observer
export class ClusterView extends React.Component {
  protected placeholder: HTMLElement;

  get cluster() {
    return clusterStore.getById(getMatchedClusterId())
  }

  componentDidMount() {
    this.attachViews();
    disposeOnUnmount(this, [
      reaction(() => this.cluster, selectedCluster => {
        this.initView(selectedCluster?.id)
        this.refreshViews()
      }, {
        fireImmediately: true
      })
    ])
  }

  componentWillUnmount() {
    this.detachViews();
  }

  // fixme: figure out how to replace webview-tag to iframe
  initView = (clusterId: ClusterId) => {
    if (!clusterId || lensViews.has(clusterId)) {
      return;
    }
    logger.info(`[WEBVIEW]: init view for clusterId=${clusterId}`)
    const webview = document.createElement("webview");
    webview.setAttribute("src", `//${clusterId}.${location.host}`)
    webview.setAttribute("nodeintegration", "true")
    webview.setAttribute("enableremotemodule", "true")
    webview.addEventListener("did-finish-load", () => {
      logger.info(`[WEBVIEW]: loaded, clusterId=${clusterId}`)
      clusterIpc.init.invokeFromRenderer(clusterId); // push cluster-state to webview
      lensViews.get(clusterId).isLoaded = true;
      this.refreshViews();
    });
    webview.addEventListener("did-fail-load", (event) => {
      logger.error(`[WEBVIEW]: failed to load, clusterId=${clusterId}`, event)
    });
    lensViews.set(clusterId, { clusterId, webview });
    lensViewsHolder.appendChild(webview); // add to dom and start loading frame
  }

  attachViews = () => {
    this.placeholder.appendChild(lensViewsHolder)
  }

  detachViews = () => {
    document.body.appendChild(lensViewsHolder);
  }

  refreshViews = () => {
    lensViews.forEach(({ clusterId, webview, isLoaded }) => {
      const isActive = clusterId === this.cluster?.id;
      webview.style.display = isLoaded && isActive ? "flex" : "none"
    })
  }

  bindRef = (elem: HTMLElement) => {
    this.placeholder = elem;
  }

  render() {
    const { cluster } = this;
    const view = lensViews.get(cluster?.id);
    const showStatusPage = cluster && (!cluster.accessible || !view?.isLoaded);
    return (
      <div className="ClusterView" ref={this.bindRef}>
        {showStatusPage && <ClusterStatus clusterId={cluster.id}/>}
      </div>
    )
  }
}
