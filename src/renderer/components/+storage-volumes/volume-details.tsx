import startCase from "lodash/startCase";
import "./volume-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { PersistentVolume, pvcApi } from "../../api/endpoints";
import { getDetailsUrl, KubeObjectDetailsProps } from "../kube-object";
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
        <DrawerItem name="Capacity">
          {capacity.storage}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name="Access Modes">
          {accessModes.join(", ")}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {persistentVolumeReclaimPolicy}
        </DrawerItem>
        <DrawerItem name="Storage Class Name">
          {storageClassName}
        </DrawerItem>
        <DrawerItem name="Status" labelsOnly>
          <Badge label={volume.getStatus()}/>
        </DrawerItem>

        {nfs && (
          <>
            <DrawerTitle title="Network File System"/>
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
            <DrawerTitle title="FlexVolume"/>
            <DrawerItem name="Driver">
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
            <DrawerTitle title="Claim"/>
            <DrawerItem name="Type">
              {claimRef.kind}
            </DrawerItem>
            <DrawerItem name="Name">
              <Link to={getDetailsUrl(pvcApi.getUrl(claimRef))}>
                {claimRef.name}
              </Link>
            </DrawerItem>
            <DrawerItem name="Namespace">
              {claimRef.namespace}
            </DrawerItem>
          </>
        )}
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
});

kubeObjectDetailRegistry.add({
  kind: "PersistentVolume",
  apiVersions: ["v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
