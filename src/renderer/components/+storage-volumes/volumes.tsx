/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volumes.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { getDetailsUrl } from "../kube-detail-params";
import { stopPropagation } from "../../utils";
import { volumesStore } from "./volumes.store";
import { persistentVolumeClaimApi, storageClassApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  claim = "claim",
  status = "status",
  age = "age",
}

@observer
export class PersistentVolumes extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="storage_volumes"
          className="PersistentVolumes"
          store={volumesStore}
          sortingCallbacks={{
            [columnId.name]: volume => volume.getName(),
            [columnId.storageClass]: volume => volume.getStorageClass(),
            [columnId.capacity]: volume => volume.getCapacity(true),
            [columnId.status]: volume => volume.getStatus(),
            [columnId.age]: volume => -volume.getCreationTimestamp(),
          }}
          searchFilters={[
            volume => volume.getSearchFields(),
            volume => volume.getClaimRefName(),
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
          renderTableContents={volume => {
            const { claimRef, storageClassName } = volume.spec;
            const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
              name: storageClassName,
            }));

            return [
              volume.getName(),
              <KubeObjectStatusIcon key="icon" object={volume} />,
              <Link
                key="link"
                to={storageClassDetailsUrl}
                onClick={stopPropagation}
              >
                {storageClassName}
              </Link>,
              volume.getCapacity(),
              claimRef && (
                <Link to={getDetailsUrl(persistentVolumeClaimApi.getUrl(claimRef))} onClick={stopPropagation}>
                  {claimRef.name}
                </Link>
              ),
              <KubeObjectAge key="age" object={volume} />,
              { title: volume.getStatus(), className: volume.getStatus().toLowerCase() },
            ];
          }}
        />
      </SiblingsInTabLayout>
    );
  }
}
