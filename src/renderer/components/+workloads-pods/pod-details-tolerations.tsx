import "./pod-details-tolerations.scss";
import React from "react";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { PodTolerations } from "./pod-tolerations";

interface Props {
  workload: WorkloadKubeObject;
}

export class PodDetailsTolerations extends React.Component<Props> {
  render() {
    const { workload } = this.props;
    const tolerations = workload.getTolerations();

    if (!tolerations.length) return null;

    return (
      <DrawerItem name="Tolerations" className="PodDetailsTolerations">
        <DrawerParamToggler label={tolerations.length}>
          <PodTolerations tolerations={tolerations} />
        </DrawerParamToggler>
      </DrawerItem>
    );
  }
}
