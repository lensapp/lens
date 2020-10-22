import "./volume-claim-details.scss"

import React, { Fragment } from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { podsStore } from "../+workloads-pods/pods.store";
import { Link } from "react-router-dom";
import { KubeEventDetails } from "../+events/kube-event-details";
import { volumeClaimStore } from "./volume-claim.store";
import { getDetailsUrl } from "../../navigation";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";
import { KubeObjectDetailsProps } from "../kube-object";
import { PersistentVolumeClaim } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

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
      <Trans>Disk</Trans>
    ];
    return (
      <div className="PersistentVolumeClaimDetails">
        <ResourceMetrics
          loader={() => volumeClaimStore.loadMetrics(volumeClaim)}
          tabs={metricTabs} object={volumeClaim} params={{ metrics }}
        >
          <VolumeClaimDiskChart/>
        </ResourceMetrics>
        <KubeObjectMeta object={volumeClaim}/>
        <DrawerItem name={<Trans>Access Modes</Trans>}>
          {accessModes.join(", ")}
        </DrawerItem>
        <DrawerItem name={<Trans>Storage Class Name</Trans>}>
          {storageClassName}
        </DrawerItem>
        <DrawerItem name={<Trans>Storage</Trans>}>
          {volumeClaim.getStorage()}
        </DrawerItem>
        <DrawerItem name={<Trans>Pods</Trans>} className="pods">
          {pods.map(pod => (
            <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
              {pod.getName()}
            </Link>
          ))}
        </DrawerItem>
        <DrawerItem name={<Trans>Status</Trans>}>
          {volumeClaim.getStatus()}
        </DrawerItem>

        <DrawerTitle title={_i18n._(t`Selector`)}/>

        <DrawerItem name={<Trans>Match Labels</Trans>} labelsOnly>
          {volumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>

        <DrawerItem name={<Trans>Match Expressions</Trans>}>
          {volumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
            <Fragment key={i}>
              <DrawerItem name={<Trans>Key</Trans>}>{key}</DrawerItem>
              <DrawerItem name={<Trans>Operator</Trans>}>{operator}</DrawerItem>
              <DrawerItem name={<Trans>Values</Trans>}>{values.join(", ")}</DrawerItem>
            </Fragment>
          ))}
        </DrawerItem>

        <KubeEventDetails object={volumeClaim}/>
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
})
