import "./storage-class-details.scss";

import React from "react";
import startCase from "lodash/startCase";
import { t, Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { StorageClass, storageClassApi } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<StorageClass> {
}

@observer
export class StorageClassDetails extends React.Component<Props> {
  render() {
    const { object: storageClass } = this.props;
    if (!storageClass) return null;
    const { provisioner, parameters, mountOptions } = storageClass;
    return (
      <div className="StorageClassDetails">
        <KubeObjectMeta object={storageClass}/>

        {provisioner && (
          <DrawerItem name={<Trans>Provisioner</Trans>} labelsOnly>
            <Badge label={provisioner}/>
          </DrawerItem>
        )}
        <DrawerItem name={<Trans>Volume Binding Mode</Trans>}>
          {storageClass.getVolumeBindingMode()}
        </DrawerItem>
        <DrawerItem name={<Trans>Reclaim Policy</Trans>}>
          {storageClass.getReclaimPolicy()}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name={<Trans>Mount Options</Trans>}>
            {mountOptions.join(", ")}
          </DrawerItem>
        )}
        {parameters && (
          <>
            <DrawerTitle title={_i18n._(t`Parameters`)}/>
            {
              Object.entries(parameters).map(([name, value]) => (
                <DrawerItem key={name + value} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}

        <KubeEventDetails object={storageClass}/>
      </div>
    );
  }
}

apiManager.registerViews(storageClassApi, {
  Details: StorageClassDetails
})