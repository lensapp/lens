import "./cluster-settings.scss";

import React from "react";
import { reaction } from "mobx";
import { RouteComponentProps } from "react-router";
import { observer, disposeOnUnmount } from "mobx-react";
import { Features } from "./features";
import { Removal } from "./removal";
import { Status } from "./status";
import { General } from "./general";
import { Cluster } from "../../../main/cluster";
import { ClusterIcon } from "../cluster-icon";
import { IClusterSettingsRouteParams } from "./cluster-settings.route";
import { clusterStore } from "../../../common/cluster-store";
import { clusterIpc } from "../../../common/cluster-ipc";
import { PageLayout } from "../layout/page-layout";

interface Props extends RouteComponentProps<IClusterSettingsRouteParams> {
}

@observer
export class ClusterSettings extends React.Component<Props> {
  get clusterId() {
    return this.props.match.params.clusterId
  }

  get cluster(): Cluster {
    return clusterStore.getById(this.clusterId);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.cluster, this.refreshCluster, {
        fireImmediately: true,
      }),
      reaction(() => this.clusterId, clusterId => clusterStore.setActive(clusterId), {
        fireImmediately: true,
      })
    ])
  }

  refreshCluster = async () => {
    if (this.cluster) {
      await clusterIpc.activate.invokeFromRenderer(this.cluster.id);
      await clusterIpc.refresh.invokeFromRenderer(this.cluster.id);
    }
  }

  render() {
    const cluster = this.cluster
    if (!cluster) return null;
    const header = (
      <>
        <ClusterIcon cluster={cluster} showErrors={false} showTooltip={false}/>
        <h2>{cluster.preferences.clusterName}</h2>
      </>
    );
    return (
      <PageLayout className="ClusterSettings" header={header}>
        <Status cluster={cluster}></Status>
        <General cluster={cluster}></General>
        <Features cluster={cluster}></Features>
        <Removal cluster={cluster}></Removal>
      </PageLayout>
    );
  }
}
