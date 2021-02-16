import "./storage-class-details.scss";

import React from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { StorageClass } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { storageClassStore } from "./storage-class.store";
import { VolumeDetailsList } from "../+storage-volumes/volume-details-list";
import { volumesStore } from "../+storage-volumes/volumes.store";

interface Props extends KubeObjectDetailsProps<StorageClass> {
}

@observer
export class StorageClassDetails extends React.Component<Props> {
  async componentDidMount() {
    volumesStore.reloadAll();
  }

  render() {
    const { object: storageClass } = this.props;
    const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);

    if (!storageClass) return null;
    const { provisioner, parameters, mountOptions } = storageClass;

    return (
      <div className="StorageClassDetails">
        <KubeObjectMeta object={storageClass}/>

        {provisioner && (
          <DrawerItem name="Provisioner" labelsOnly>
            <Badge label={provisioner}/>
          </DrawerItem>
        )}
        <DrawerItem name="Volume Binding Mode">
          {storageClass.getVolumeBindingMode()}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {storageClass.getReclaimPolicy()}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}
        {parameters && (
          <>
            <DrawerTitle title="Parameters"/>
            {
              Object.entries(parameters).map(([name, value]) => (
                <DrawerItem key={name + value} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}
        <VolumeDetailsList persistentVolumes={persistentVolumes}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "StorageClass",
  apiVersions: ["storage.k8s.io/v1"],
  components: {
    Details: (props) => <StorageClassDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "StorageClass",
  apiVersions: ["storage.k8s.io/v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
