import "./cluster-settings.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { Features } from "./features";
import { Removal } from "./removal";
import { Status } from "./status";
import { General } from "./general";
import { WizardLayout } from "../layout/wizard-layout";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { getMatchedCluster } from "../cluster-manager/cluster-view.route";

@observer
export class ClusterSettings extends React.Component {
  render() {
    const cluster = getMatchedCluster();
    if (!cluster) return null;
    const header = (
      <>
        <ClusterIcon
          cluster={cluster}
          showErrors={false}
          showTooltip={false}
        />
        <h2>{cluster.preferences.clusterName}</h2>
        <Link to="/">
          <Icon material="close" big/>
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
