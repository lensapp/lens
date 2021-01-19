import "./pod-disruption-budgets-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { KubeObjectDetailsProps } from "../kube-object";
import { PodDisruptionBudget } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<PodDisruptionBudget> {
}

@observer
export class PodDisruptionBudgetDetails extends React.Component<Props> {

  render() {
    const { object: pdb } = this.props;

    if (!pdb) return null;
    const selectors = pdb.getSelectors();

    return (
      <div className="PdbDetails">
        <KubeObjectMeta object={pdb}/>

        {selectors.length > 0 &&
          <DrawerItem name="Selector" labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label}/>)
            }
          </DrawerItem>
        }

        <DrawerItem name="Min Available">
          {pdb.getMinAvailable()}
        </DrawerItem>

        <DrawerItem name="Max Unavailable">
          {pdb.getMaxUnavailable()}
        </DrawerItem>

        <DrawerItem name="Current Healthy">
          {pdb.getCurrentHealthy()}
        </DrawerItem>

        <DrawerItem name="Desired Healthy">
          {pdb.getDesiredHealthy()}
        </DrawerItem>

      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "PodDisruptionBudget",
  apiVersions: ["policy/v1beta1"],
  components: {
    Details: (props) => <PodDisruptionBudgetDetails {...props} />
  }
});
