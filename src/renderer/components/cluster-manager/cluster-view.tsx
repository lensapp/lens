import "./cluster-view.scss"
import React from "react";
import { observer } from "mobx-react";
import { getMatchedCluster } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView } from "./lens-views";

@observer
export class ClusterView extends React.Component {
  render() {
    const cluster = getMatchedCluster();
    const showStatus = cluster && (!cluster.available || !hasLoadedView(cluster.id))
    return (
      <div className="ClusterView">
        {showStatus && (
          <ClusterStatus key={cluster.id} clusterId={cluster.id} className="box center"/>
        )}
      </div>
    )
  }
}
