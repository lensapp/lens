import React from "react";
import { autorun, computed, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedClusterId } from "./cluster-view.route";
import { Cluster } from "../../../main/cluster";

@observer
export class ClusterView extends React.Component {
  static views = observable.map<ClusterId, /*HTMLIFrameElement*/ any>()
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

  activateView = (cluster: Cluster) => {
    if (!cluster || ClusterView.views.has(cluster.id)) {
      return;
    }
    const view = document.createElement("webview");
    view.className = "ClusterView"
    view.src = `${location.protocol}://${cluster.id}.${location.host}`
    view.onload = () => console.log('CLUSTER VIEW READY!', cluster);
    document.body.appendChild(view);
    ClusterView.views.set(cluster.id, view);
  }

  render() {
    const { cluster } = this;
    if (cluster && cluster.accessible) {

    }
    return "";
  }
}
