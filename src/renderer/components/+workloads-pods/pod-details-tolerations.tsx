import "./pod-details-tolerations.scss";
import React from "react";
import { Trans } from "@lingui/macro";
import { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job } from "../../api/endpoints";
import { DrawerParamToggler, DrawerItem } from "../drawer";

interface Props {
  workload: Pod | Deployment | DaemonSet | StatefulSet | ReplicaSet | Job;
}

export class PodDetailsTolerations extends React.Component<Props> {
  render() {
    const { workload } = this.props;
    const tolerations = workload.getTolerations();

    if (!tolerations.length) return null;

    return (
      <DrawerItem name={<Trans>Tolerations</Trans>} className="PodDetailsTolerations">
        <DrawerParamToggler label={tolerations.length}>
          {
            tolerations.map((toleration, index) => {
              const { key, operator, effect, tolerationSeconds } = toleration;

              return (
                <div className="toleration" key={index}>
                  <DrawerItem name={<Trans>Key</Trans>}>{key}</DrawerItem>
                  {operator && <DrawerItem name={<Trans>Operator</Trans>}>{operator}</DrawerItem>}
                  {effect && <DrawerItem name={<Trans>Effect</Trans>}>{effect}</DrawerItem>}
                  {!!tolerationSeconds && <DrawerItem name={<Trans>Effect</Trans>}>{tolerationSeconds}</DrawerItem>}
                </div>
              );
            })
          }
        </DrawerParamToggler>
      </DrawerItem>
    );
  }
}