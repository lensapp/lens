import startCase from "lodash/startCase"
import "./volume-details.scss"

import React from "react";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { getDetailsUrl } from "../../navigation";
import { PersistentVolume, pvcApi } from "../../api/endpoints";
import { KubeObjectDetailsProps } from "../kube-object";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<PersistentVolume> {
}

@observer
export class PersistentVolumeDetails extends React.Component<Props> {
  render() {
    const { object: volume } = this.props;
    if (!volume) {
      return null;
    }
    const { accessModes, capacity, persistentVolumeReclaimPolicy, storageClassName, claimRef, flexVolume, mountOptions, nfs } = volume.spec;
    return (
      <div className="PersistentVolumeDetails">
        <KubeObjectMeta object={volume}/>
        <DrawerItem name={<Trans>Capacity</Trans>}>
          {capacity.storage}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name={<Trans>Mount Options</Trans>}>
            {mountOptions.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name={<Trans>Access Modes</Trans>}>
          {accessModes.join(", ")}
        </DrawerItem>
        <DrawerItem name={<Trans>Reclaim Policy</Trans>}>
          {persistentVolumeReclaimPolicy}
        </DrawerItem>
        <DrawerItem name={<Trans>Storage Class Name</Trans>}>
          {storageClassName}
        </DrawerItem>
        <DrawerItem name={<Trans>Status</Trans>} labelsOnly>
          <Badge label={volume.getStatus()}/>
        </DrawerItem>

        {nfs && (
          <>
            <DrawerTitle title={<Trans>Network File System</Trans>}/>
            {
              Object.entries(nfs).map(([name, value]) => (
                <DrawerItem key={name} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}

        {flexVolume && (
          <>
            <DrawerTitle title={<Trans>FlexVolume</Trans>}/>
            <DrawerItem name={<Trans>Driver</Trans>}>
              {flexVolume.driver}
            </DrawerItem>
            {
              Object.entries(flexVolume.options).map(([name, value]) => (
                <DrawerItem key={name} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}

        {claimRef && (
          <>
            <DrawerTitle title={<Trans>Claim</Trans>}/>
            <DrawerItem name={<Trans>Type</Trans>}>
              {claimRef.kind}
            </DrawerItem>
            <DrawerItem name={<Trans>Name</Trans>}>
              <Link to={getDetailsUrl(pvcApi.getUrl(claimRef))}>
                {claimRef.name}
              </Link>
            </DrawerItem>
            <DrawerItem name={<Trans>Namespace</Trans>}>
              {claimRef.namespace}
            </DrawerItem>
          </>
        )}

        <KubeEventDetails object={volume}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "PersistentVolume",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <PersistentVolumeDetails {...props} />
  }
})
