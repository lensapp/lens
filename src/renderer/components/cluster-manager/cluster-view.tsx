import "./cluster-view.scss"
import React from "react";
import { WebviewTag } from "electron"
import { autorun, computed, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedClusterId } from "./cluster-view.route";
import { Cluster } from "../../../main/cluster";
import { ClusterStatus } from "./cluster-status";

@observer
export class ClusterView extends React.Component {
  static views = observable.map<ClusterId, WebviewTag>()
  static isLoaded = observable.map<ClusterId, boolean>()

  @computed get cluster() {
    return clusterStore.getById(getMatchedClusterId())
  }

  @computed get clusterView() {
    return ClusterView.views.get(this.cluster?.id)
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => this.activateView(this.cluster))
    ])
  }

  // fixme
  activateView = (cluster: Cluster) => {
    if (!cluster || ClusterView.views.has(cluster.id)) {
      return;
    }
    const view = document.createElement("webview");
    view.className = "ClusterView"
    view.setAttribute("nodeintegration", "true")
    view.setAttribute("enableremotemodule", "true")
    view.addEventListener("did-finish-load", () => {
      console.log('CLUSTER VIEW READY!', cluster)
      // view.openDevTools()
    });
    view.addEventListener("did-fail-load", event => {
      // todo: handle
    });
    view.src = `${location.protocol}//${cluster.id}.${location.host}`
    document.body.appendChild(view);
    ClusterView.views.set(cluster.id, view);
  }

  render() {
    const { cluster } = this;
    if (cluster) {
      return <ClusterStatus clusterId={cluster.id}/>
    }
  }
}
