import "./volume-claim-details.scss";

import React, { Fragment } from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { podsStore } from "../+workloads-pods/pods.store";
import { Link } from "react-router-dom";
import { KubeEventDetails } from "../+events/kube-event-details";
import { volumeClaimStore } from "./volume-claim.store";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";
import { getDetailsUrl, KubeObjectDetailsProps, KubeObjectMeta } from "../kube-object";
import { PersistentVolumeClaim } from "../../api/endpoints";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";
import { clusterStore } from "../../../common/cluster-store";

interface Props extends KubeObjectDetailsProps<PersistentVolumeClaim> {
}

@observer
export class PersistentVolumeClaimDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    volumeClaimStore.reset();
  });

  componentWillUnmount() {
    volumeClaimStore.reset();
  }

  render() {
    const { object: volumeClaim } = this.props;

    if (!volumeClaim) {
      return null;
    }
    const { storageClassName, accessModes } = volumeClaim.spec;
    const { metrics } = volumeClaimStore;
    const pods = volumeClaim.getPods(podsStore.items);
    const metricTabs = [
      "Disk"
    ];
    const isMetricHidden = clusterStore.isMetricHidden(ResourceType.VolumeClaim);

    return (
      <div className="PersistentVolumeClaimDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={() => volumeClaimStore.loadMetrics(volumeClaim)}
            tabs={metricTabs} object={volumeClaim} params={{ metrics }}
          >
            <VolumeClaimDiskChart/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={volumeClaim}/>
        <DrawerItem name="Access Modes">
          {accessModes.join(", ")}
        </DrawerItem>
        <DrawerItem name="Storage Class Name">
          {storageClassName}
        </DrawerItem>
        <DrawerItem name="Storage">
          {volumeClaim.getStorage()}
        </DrawerItem>
        <DrawerItem name="Pods" className="pods">
          {pods.map(pod => (
            <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
              {pod.getName()}
            </Link>
          ))}
        </DrawerItem>
        <DrawerItem name="Status">
          {volumeClaim.getStatus()}
        </DrawerItem>

        <DrawerTitle title="Selector"/>

        <DrawerItem name="Match Labels" labelsOnly>
          {volumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>

        <DrawerItem name="Match Expressions">
          {volumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
            <Fragment key={i}>
              <DrawerItem name="Key">{key}</DrawerItem>
              <DrawerItem name="Operator">{operator}</DrawerItem>
              <DrawerItem name="Values">{values.join(", ")}</DrawerItem>
            </Fragment>
          ))}
        </DrawerItem>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "PersistentVolumeClaim",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <PersistentVolumeClaimDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "PersistentVolumeClaim",
  apiVersions: ["v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
