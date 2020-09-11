import "./cluster-settings.scss";

import React from "react";
import { observer } from "mobx-react";
import { Features } from "./features";
import { Removal } from "./removal";
import { Status } from "./status";
import { General } from "./general";
import { WizardLayout } from "../layout/wizard-layout";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { navigate } from "../../navigation";
import { IClusterSettingsRouteParams } from "./cluster-settings.route";
import { clusterStore } from "../../../common/cluster-store";
import { RouteComponentProps } from "react-router";

interface Props extends RouteComponentProps<IClusterSettingsRouteParams> {
}

@observer
export class ClusterSettings extends React.Component<Props> {
  async componentDidMount() {
    window.addEventListener('keydown', this.onEscapeKey);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onEscapeKey);
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    if (evt.code === "Escape") {
      evt.stopPropagation();
      this.close();
    }
  }

  close() {
    navigate("/");
  }

  render() {
    const cluster = clusterStore.getById(this.props.match.params.clusterId);
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
