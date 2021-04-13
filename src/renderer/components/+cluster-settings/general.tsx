import React from "react";
import { Cluster } from "../../../main/cluster";
import { ClusterNameSetting } from "./components/cluster-name-setting";
import { ClusterProxySetting } from "./components/cluster-proxy-setting";
import { ClusterPrometheusSetting } from "./components/cluster-prometheus-setting";
import { ClusterHomeDirSetting } from "./components/cluster-home-dir-setting";
import { ClusterAccessibleNamespaces } from "./components/cluster-accessible-namespaces";
import { ClusterMetricsSetting } from "./components/cluster-metrics-setting";
import { ShowMetricsSetting } from "./components/show-metrics";

interface Props {
  cluster: Cluster;
}

export class General extends React.Component<Props> {
  render() {
    return <div>
      <h2>General</h2>
      <ClusterNameSetting cluster={this.props.cluster} />
      <ClusterProxySetting cluster={this.props.cluster} />
      <ClusterPrometheusSetting cluster={this.props.cluster} />
      <ClusterHomeDirSetting cluster={this.props.cluster} />
      <ClusterAccessibleNamespaces cluster={this.props.cluster} />
      <ClusterMetricsSetting cluster={this.props.cluster}/>
      <ShowMetricsSetting cluster={this.props.cluster}/>
    </div>;
  }
}
