import React from "react";
import { Cluster } from "../../../main/cluster";
import { InstallMetrics } from "./components/install-metrics";
import { InstallUserMode } from "./components/install-user-mode";

interface Props {
  cluster: Cluster;
}

export class Features extends React.Component<Props> {
  render() {
    const { cluster } = this.props;

    return <div>
      <h2>Features</h2>
      <InstallMetrics cluster={cluster}/>
      <InstallUserMode cluster={cluster}/>
    </div>;
  }
}