import "./cluster-view.scss"
import React from "react";
import { WebviewTag } from "electron"
import { autorun, computed, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedClusterId } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import logger from "../../../main/logger";
import { clusterIpc } from "../../../common/cluster-ipc";

@observer
export class ClusterView extends React.Component {
  static views = observable.map<ClusterId, WebviewTag>()
  static isLoaded = observable.map<ClusterId, boolean>()

  @observable.ref placeholder: HTMLElement;

  @computed get cluster() {
    return clusterStore.getById(getMatchedClusterId())
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        if (this.cluster) {
          this.initView(this.cluster.id)
          this.attachView(this.cluster.id)
        }
      })
    ])
  }

  initView = (clusterId: ClusterId) => {
    if (ClusterView.views.has(clusterId)) {
      return;
    }
    const webview = document.createElement("webview");
    webview.className = "ClusterView"
    webview.setAttribute("src", `//${clusterId}.${location.host}`)
    webview.setAttribute("nodeintegration", "true")
    webview.setAttribute("enableremotemodule", "true")
    webview.addEventListener("did-finish-load", () => {
      // webview.openDevTools()
      webview.classList.add("loaded");
      clusterIpc.init.invokeFromRenderer(clusterId); // push-state to webview
      ClusterView.isLoaded.set(clusterId, true);
    });
    webview.addEventListener("did-fail-load", (event) => {
      logger.error("failed to load lens-webview", event)
    });
    document.body.appendChild(webview);
    ClusterView.views.set(clusterId, webview);
  }

  attachView = async (clusterId: ClusterId) => {
    const view = ClusterView.views.get(clusterId);
    const isLoaded = ClusterView.views.has(clusterId);
    if (view && isLoaded && this.placeholder) {
      this.placeholder.replaceWith(view);
    }
  }

  render() {
    const { cluster } = this;
    if (cluster) {
      if (!cluster.accessible) {
        return <ClusterStatus clusterId={cluster.id}/>
      }
      return <div ref={e => this.placeholder = e}/>
    }
  }
}
