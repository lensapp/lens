import "./cluster-settings.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Features } from "./features";
import { Removal } from "./removal";
import { Status } from "./status";
import { General } from "./general";
import { Cluster } from "../../../main/cluster";
import { WizardLayout } from "../layout/wizard-layout";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { navigate } from "../../navigation";
import { IClusterSettingsRouteParams } from "./cluster-settings.route";
import { clusterStore } from "../../../common/cluster-store";
import { clusterIpc } from "../../../common/cluster-ipc";

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

  async componentDidMount() {
    window.addEventListener("keydown", this.onEscapeKey);
    disposeOnUnmount(this, [
      reaction(() => this.cluster, this.refreshCluster, {
        fireImmediately: true,
      }),
      reaction(() => this.clusterId, clusterId => clusterStore.setActive(clusterId), {
        fireImmediately: true,
      })
    ])
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onEscapeKey);
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    if (evt.code === "Escape") {
      evt.stopPropagation();
      this.close();
    }
  }

  refreshCluster = (cluster: Cluster) => {
    if (!cluster) return;
    clusterIpc.refresh.invokeFromRenderer(cluster.id);
  }

  close() {
    navigate("/");
  }

  render() {
    const cluster = this.cluster
    if (!cluster) return null;
    const header = (
      <>
        <ClusterIcon
          cluster={cluster}
          showErrors={false}
          showTooltip={false}
        />
        <h2>{cluster.preferences.clusterName}</h2>
        <Icon material="close" onClick={this.close} big/>
      </>
    );
    return (
      <div className="ClusterSettings">
        <WizardLayout header={header} centered>
          <Status cluster={cluster}></Status>
          <General cluster={cluster}></General>
          <Features cluster={cluster}></Features>
          <Removal cluster={cluster}></Removal>
        </WizardLayout>
      </div>
    );
  }
}
