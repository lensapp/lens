/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./volumes.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { getDetailsUrl } from "../kube-detail-params";
import { stopPropagation } from "../../utils";
import { volumesStore } from "./volumes.store";
import { pvcApi, storageClassApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { VolumesRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  claim = "claim",
  status = "status",
  age = "age",
}

interface Props extends RouteComponentProps<VolumesRouteParams> {
}

@observer
export class PersistentVolumes extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="storage_volumes"
        className="PersistentVolumes"
        store={volumesStore}
        sortingCallbacks={{
          [columnId.name]: item => item.getName(),
          [columnId.storageClass]: item => item.getStorageClass(),
          [columnId.capacity]: item => item.getCapacity(true),
          [columnId.status]: item => item.getStatus(),
          [columnId.age]: item => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          item => item.getSearchFields(),
          item => item.getClaimRefName(),
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
            { title: volume.getStatus(), className: volume.getStatus().toLowerCase() },
          ];
        }}
      />
    );
  }
}
