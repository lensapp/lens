import React from "react";
import { Cluster } from "../../../main/cluster";
import { RemoveClusterButton } from "./components/remove-cluster-button";

interface Props {
  cluster: Cluster;
}

export class Removal extends React.Component<Props> {
  render() {
    const { cluster } = this.props;

    return (
      <div>
        <h2>Removal</h2>
        <RemoveClusterButton cluster={cluster} />
      </div>
    );
  }
}