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
import { PageLayout } from "../layout/page-layout";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler, clusterRefreshHandler } from "../../../common/cluster-ipc";
import { ScrollSpy } from "../scroll-spy/scroll-spy";
import { Metrics } from "./metrics";
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
        <ClusterIcon cluster={cluster} showErrors={false} showTooltip={false} isActive />
        <h1>{cluster.preferences.clusterName}</h1>
      </>
    );

    return (
      <ScrollSpy htmlFor="ScrollSpyRoot" render={navigation => (
        <PageLayout
          className="ClusterSettings"
          header={header}
          showOnTop={true}
          navigation={navigation}
          contentGaps={false}
        >
          <Status cluster={cluster}></Status>
          <General cluster={cluster}></General>
          <Metrics cluster={cluster}></Metrics>
          <Features cluster={cluster}></Features>
          <Removal cluster={cluster}></Removal>
        </PageLayout>
      )}/>
    );
  }
}
