import "./volumes.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Link, RouteComponentProps } from "react-router-dom";
import { PersistentVolume, persistentVolumeApi } from "../../api/endpoints/persistent-volume.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { IVolumesRouteParams } from "./volumes.route";
import { stopPropagation } from "../../utils";
import { getDetailsUrl } from "../../navigation";
import { volumesStore } from "./volumes.store";
import { pvcApi, storageClassApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  status = "status",
  age = "age",
}

interface Props extends RouteComponentProps<IVolumesRouteParams> {
}

@observer
export class PersistentVolumes extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="PersistentVolumes"
        store={volumesStore} isClusterScoped
        sortingCallbacks={{
          [sortBy.name]: (item: PersistentVolume) => item.getName(),
          [sortBy.storageClass]: (item: PersistentVolume) => item.spec.storageClassName,
          [sortBy.capacity]: (item: PersistentVolume) => item.getCapacity(true),
          [sortBy.status]: (item: PersistentVolume) => item.getStatus(),
          [sortBy.age]: (item: PersistentVolume) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PersistentVolume) => item.getSearchFields(),
          (item: PersistentVolume) => item.getClaimRefName(),
        ]}
        renderHeaderTitle={<Trans>Persistent Volumes</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Storage Class</Trans>, className: "storageClass", sortBy: sortBy.storageClass },
          { title: <Trans>Capacity</Trans>, className: "capacity", sortBy: sortBy.capacity },
          { title: <Trans>Claim</Trans>, className: "claim" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
        ]}
        renderTableContents={(volume: PersistentVolume) => {
          const { claimRef, storageClassName } = volume.spec;
          const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
            name: storageClassName
          }));
          return [
            volume.getName(),
            <Link to={storageClassDetailsUrl} onClick={stopPropagation}>
              {storageClassName}
            </Link>,
            volume.getCapacity(),
            claimRef && (
              <Link to={getDetailsUrl(pvcApi.getUrl(claimRef))} onClick={stopPropagation}>
                {claimRef.name}
              </Link>
            ),
            volume.getAge(),
            { title: volume.getStatus(), className: volume.getStatus().toLowerCase() }
          ]
        }}
      />
    )
  }
}
