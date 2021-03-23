import React from "react";

import { Cluster } from "../../../main/cluster";
import { ClusterAccessibleNamespaces } from "./components/cluster-accessible-namespaces";
import { ClusterHomeDirSetting } from "./components/cluster-home-dir-setting";
import { ClusterIconSetting } from "./components/cluster-icon-setting";
import { ClusterNameSetting } from "./components/cluster-name-setting";
import { ClusterProxySetting } from "./components/cluster-proxy-setting";
import { ClusterWorkspaceSetting } from "./components/cluster-workspace-setting";

interface Props {
  cluster: Cluster;
}

export class General extends React.Component<Props> {
  render() {
    return (
      <section id="general" title="General">
        <section>
          <h1>General</h1>
        </section>
        <section id="cluster">
          <h2>Cluster</h2>
          <ClusterNameSetting cluster={this.props.cluster} />
          <ClusterWorkspaceSetting cluster={this.props.cluster} />
          <ClusterIconSetting cluster={this.props.cluster} />
        </section>
        <section id="proxy">
          <h2>Proxy</h2>
          <ClusterProxySetting cluster={this.props.cluster} />
        </section>
        <section id="terminal">
          <h2>Terminal</h2>
          <ClusterHomeDirSetting cluster={this.props.cluster} />
        </section>
        <section id="namespaces">
          <h2>Namespaces</h2>
          <ClusterAccessibleNamespaces cluster={this.props.cluster} />
        </section>
      </section>
    );
  }
}
