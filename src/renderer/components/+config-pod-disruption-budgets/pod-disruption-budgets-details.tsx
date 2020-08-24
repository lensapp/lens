import "./pod-disruption-budgets-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectDetailsProps } from "../kube-object";
import { PodDisruptionBudget, pdbApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { KubeObjectStore } from "../../kube-object.store";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

@observer
export class PodDisruptionBudgetDetails extends React.Component<Props> {

  render() {
    const { object: pdb } = this.props;
    if (!pdb) return null
    const { status, spec } = pdb
    const selectors = pdb.getSelectors();
    return (
      <div className="PdbDetails">
        <KubeObjectMeta object={pdb}/>

        {selectors.length > 0 &&
        <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }

        <DrawerItem name={<Trans>Min Available</Trans>}>
          {pdb.getMinAvailable()}
        </DrawerItem>

        <DrawerItem name={<Trans>Max Unavailable</Trans>}>
          {pdb.getMaxUnavailable()}
        </DrawerItem>

        <DrawerItem name={<Trans>Current Healthy</Trans>}>
          {pdb.getCurrentHealthy()}
        </DrawerItem>

        <DrawerItem name={<Trans>Desired Healthy</Trans>}>
          {pdb.getDesiredHealthy()}
        </DrawerItem>

      </div>
    )
  }
}

apiManager.registerViews(pdbApi, {
  Details: PodDisruptionBudgetDetails,
});
