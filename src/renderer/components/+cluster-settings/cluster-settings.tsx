import "./cluster-settings.scss"
import React from "react";
import { observer } from "mobx-react";
import { Features } from "./features"
import { Removal } from "./removal"
import { Status } from "./status"
import { General } from "./general"
import { getHostedCluster } from "../../../common/cluster-store"
import { WizardLayout } from "../layout/wizard-layout";

@observer
export class ClusterSettings extends React.Component {
  render() {
    const cluster = getHostedCluster();
    return (
      <WizardLayout className="ClusterSettings">
        <Status cluster={cluster}></Status>
        <General cluster={cluster}></General>
        <Features cluster={cluster}></Features>
        <Removal cluster={cluster}></Removal>
      </WizardLayout>
    )
  }
}
