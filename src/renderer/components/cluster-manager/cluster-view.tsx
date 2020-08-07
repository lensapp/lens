import "./cluster-view.scss"
import React from "react";
import { WebviewTag } from "electron"
import { action, autorun, computed, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedClusterId } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import logger from "../../../main/logger";
import { clusterIpc } from "../../../common/cluster-ipc";

const lensViews = observable.map<ClusterId, WebviewTag>()
const isLoaded = observable.map<ClusterId, boolean>()

@observer
export class ClusterView extends React.Component {
  protected placeholder: HTMLElement;

  @computed get cluster() {
    return clusterStore.getById(getMatchedClusterId())
  }

  // fixme: attach/detach doesn't work properly
  componentDidMount() {
    // disposeOnUnmount(this, [
    //   autorun(() => {
    //     const activeClusterId = this.cluster?.id;
    //     if (activeClusterId) {
    //       this.initView(activeClusterId);
    //       Array.from(lensViews).forEach(([clusterId, view]) => {
    //         if (activeClusterId === clusterId && isLoaded.has(clusterId)) {
    //           this.placeholder.appendChild(view)
    //         } else {
    //           view.parentElement.removeChild(view);
    //         }
    //       })
    //     }
    //   }),
    // ])
  }

  @action
  initView(clusterId: ClusterId) {
    if (lensViews.has(clusterId)) {
      return;
    }
    logger.info(`[WEBVIEW]: init view for clusterId=${clusterId}`)
    const webview = document.createElement("webview");
    webview.className = "ClusterView"
    webview.setAttribute("src", `//${clusterId}.${location.host}`)
    webview.setAttribute("nodeintegration", "true")
    webview.setAttribute("enableremotemodule", "true")
    webview.addEventListener("did-finish-load", () => {
      logger.info(`[WEBVIEW]: loaded, clusterId=${clusterId}`)
      isLoaded.set(clusterId, true);
      webview.classList.add("loaded")
      clusterIpc.init.invokeFromRenderer(clusterId); // push cluster-state to webview
    });
    webview.addEventListener("did-fail-load", (event) => {
      logger.error(`[WEBVIEW]: failed to load, clusterId=${clusterId}`, event)
    });
    lensViews.set(clusterId, webview);
    document.body.appendChild(webview);
  }

  bindRef = (elem: HTMLElement) => {
    this.placeholder = elem;
  }

  render() {
    const { cluster } = this;
    const showStatus = cluster && !cluster.accessible;
    return (
      <div className="ClusterView" ref={this.bindRef}>
        {showStatus && <ClusterStatus clusterId={cluster.id}/>}
      </div>
    )
  }
}
