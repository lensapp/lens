import "./cluster-view.scss"
import React from "react";
import { observer } from "mobx-react";
import { getMatchedCluster } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";

@observer
export class ClusterView extends React.Component {
  renderContent() {
    const cluster = getMatchedCluster();
    if (!cluster) {
      return;
    }
    if (!cluster.available) {
      return <ClusterStatus clusterId={cluster.id} className="box center"/>
    }
  }

  render() {
    const cluster = getMatchedCluster();
    return (
      <div className="ClusterView flex column">
        {this.renderContent()}
      </div>
    )
  }
}
