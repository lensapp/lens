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
      <section id="remove">
        <h1>Removal</h1>
        <div className="flex justify-flex-start">
          <RemoveClusterButton cluster={cluster}/>
        </div>
      </section>
    );
  }
}
