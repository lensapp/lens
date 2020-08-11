import "./cluster-settings.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { Features } from "./features";
import { Removal } from "./removal";
import { Status } from "./status";
import { General } from "./general";
import { getHostedCluster } from "../../../common/cluster-store";
import { WizardLayout } from "../layout/wizard-layout";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";

@observer
export class ClusterSettings extends React.Component {
  render() {
    const cluster = getHostedCluster();
    const header = (
      <>
        <ClusterIcon
          cluster={cluster}
          showErrors={false}
          showTooltip={false}
        />
        <h2>{cluster.preferences.clusterName}</h2>
        <Link to="/">
          <Icon material="close" big />
        </Link>
      </>
    );
    return (
      <div className="ClusterSettings">
        <WizardLayout header={header}>
          <div className="settings-wrapper">
            <Status cluster={cluster}></Status>
            <General cluster={cluster}></General>
            <Features cluster={cluster}></Features>
            <Removal cluster={cluster}></Removal>
          </div>
        </WizardLayout>
      </div>
    );
  }
}
