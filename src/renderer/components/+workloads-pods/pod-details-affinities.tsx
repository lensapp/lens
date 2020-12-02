import "./pod-details-affinities.scss";
import React from "react";
import jsYaml from "js-yaml";
import { Trans } from "@lingui/macro";
import { AceEditor } from "../ace-editor";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job } from "../../api/endpoints";

interface Props {
  workload: Pod | Deployment | DaemonSet | StatefulSet | ReplicaSet | Job;
}

export class PodDetailsAffinities extends React.Component<Props> {
  render() {
    const { workload } = this.props;
    const affinitiesNum = workload.getAffinityNumber();
    const affinities = workload.getAffinity();

    if (!affinitiesNum) return null;

    return (
      <DrawerItem name={<Trans>Affinities</Trans>} className="PodDetailsAffinities">
        <DrawerParamToggler label={affinitiesNum}>
          <div className="ace-container">
            <AceEditor
              mode="yaml"
              value={jsYaml.dump(affinities)}
              showGutter={false}
              readOnly
            />
          </div>
        </DrawerParamToggler>
      </DrawerItem>
    );
  }
}