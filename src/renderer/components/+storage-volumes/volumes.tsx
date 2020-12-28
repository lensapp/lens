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
        renderHeaderTitle="Persistent Volumes"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Storage Class", className: "storageClass", sortBy: sortBy.storageClass },
          { title: "Capacity", className: "capacity", sortBy: sortBy.capacity },
          { title: "Claim", className: "claim" },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Status", className: "status", sortBy: sortBy.status },
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
