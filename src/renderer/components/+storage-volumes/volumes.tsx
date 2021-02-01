import "./volumes.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import { PersistentVolume } from "../../api/endpoints/persistent-volume.api";
import { getDetailsUrl, KubeObjectListLayout } from "../kube-object";
import { IVolumesRouteParams } from "./volumes.route";
import { stopPropagation } from "../../utils";
import { volumesStore } from "./volumes.store";
import { pvcApi, storageClassApi } from "../../api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  claim = "claim",
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
        isConfigurable
        tableId="storage_volumes"
        className="PersistentVolumes"
        store={volumesStore} isClusterScoped
        sortingCallbacks={{
          [columnId.name]: (item: PersistentVolume) => item.getName(),
          [columnId.storageClass]: (item: PersistentVolume) => item.spec.storageClassName,
          [columnId.capacity]: (item: PersistentVolume) => item.getCapacity(true),
          [columnId.status]: (item: PersistentVolume) => item.getStatus(),
          [columnId.age]: (item: PersistentVolume) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PersistentVolume) => item.getSearchFields(),
          (item: PersistentVolume) => item.getClaimRefName(),
        ]}
        renderHeaderTitle="Persistent Volumes"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Storage Class", className: "storageClass", sortBy: columnId.storageClass, id: columnId.storageClass },
          { title: "Capacity", className: "capacity", sortBy: columnId.capacity, id: columnId.capacity },
          { title: "Claim", className: "claim", id: columnId.claim },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
        ]}
        renderTableContents={(volume: PersistentVolume) => {
          const { claimRef, storageClassName } = volume.spec;
          const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
            name: storageClassName
          }));

          return [
            volume.getName(),
            <KubeObjectStatusIcon key="icon" object={volume} />,
            <Link key="link" to={storageClassDetailsUrl} onClick={stopPropagation}>
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
          ];
        }}
      />
    );
  }
}
