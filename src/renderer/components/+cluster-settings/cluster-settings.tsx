import "./cluster-settings.scss";

import React from "react";
import { reaction } from "mobx";
import { RouteComponentProps } from "react-router";
import { observer, disposeOnUnmount } from "mobx-react";
import { Status } from "./status";
import { General } from "./general";
import { Cluster } from "../../../main/cluster";
import { IClusterSettingsRouteParams } from "./cluster-settings.route";
import { clusterStore } from "../../../common/cluster-store";
import { PageLayout } from "../layout/page-layout";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler, clusterRefreshHandler } from "../../../common/cluster-ipc";
import { navigation } from "../../navigation";

interface Props extends RouteComponentProps<IClusterSettingsRouteParams> {
}

@observer
export class ClusterSettings extends React.Component<Props> {
  get clusterId() {
    return this.props.match.params.clusterId;
  }

  get cluster(): Cluster {
    return clusterStore.getById(this.clusterId);
  }

  componentDidMount() {
    const { hash } = navigation.location;

    document.getElementById(hash.slice(1))?.scrollIntoView();

    disposeOnUnmount(this, [
      reaction(() => this.cluster, this.refreshCluster, {
        fireImmediately: true,
      }),
      reaction(() => this.clusterId, clusterId => clusterStore.setActive(clusterId), {
        fireImmediately: true,
      })
    ]);
  }

  refreshCluster = async () => {
    if (this.cluster) {
      await requestMain(clusterActivateHandler, this.cluster.id);
      await requestMain(clusterRefreshHandler, this.cluster.id);
    }
  };

  render() {
    const cluster = this.cluster;

    if (!cluster) return null;
    const header = (
      <>
        <h2>{cluster.preferences.clusterName}</h2>
      </>
    );

    return (
      <PageLayout className="ClusterSettings" header={header} showOnTop={true}>
        <Status cluster={cluster}></Status>
        <General cluster={cluster}></General>
      </PageLayout>
    );
  }
}
