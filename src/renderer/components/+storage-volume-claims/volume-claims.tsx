/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-claims.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { persistentVolumeClaimStore } from "./volume-claim.store";
import { podStore } from "../+workloads-pods/legacy-store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { unitsToBytes } from "../../../common/utils/convertMemory";
import { stopPropagation } from "../../utils";
import { storageClassApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { getDetailsUrl } from "../kube-detail-params";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  size = "size",
  storageClass = "storage-class",
  status = "status",
  age = "age",
}

@observer
export class PersistentVolumeClaims extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="storage_volume_claims"
          className="PersistentVolumeClaims"
          store={persistentVolumeClaimStore}
          dependentStores={[podStore]}
          sortingCallbacks={{
            [columnId.name]: pvc => pvc.getName(),
            [columnId.namespace]: pvc => pvc.getNs(),
            [columnId.pods]: pvc => pvc.getPods(podStore.items).map(pod => pod.getName()),
            [columnId.status]: pvc => pvc.getStatus(),
            [columnId.size]: pvc => unitsToBytes(pvc.getStorage()),
            [columnId.storageClass]: pvc => pvc.spec.storageClassName,
            [columnId.age]: pvc => -pvc.getCreationTimestamp(),
          }}
          searchFilters={[
            pvc => pvc.getSearchFields(),
            pvc => pvc.getPods(podStore.items).map(pod => pod.getName()),
          ]}
          renderHeaderTitle="Persistent Volume Claims"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Storage class", className: "storageClass", sortBy: columnId.storageClass, id: columnId.storageClass },
            { title: "Size", className: "size", sortBy: columnId.size, id: columnId.size },
            { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
          ]}
          renderTableContents={pvc => {
            const pods = pvc.getPods(podStore.items);
            const { storageClassName } = pvc.spec;
            const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
              name: storageClassName,
            }));

            return [
              pvc.getName(),
              <KubeObjectStatusIcon key="icon" object={pvc} />,
              pvc.getNs(),
              <Link
                key="link"
                to={storageClassDetailsUrl}
                onClick={stopPropagation}
              >
                {storageClassName}
              </Link>,
              pvc.getStorage(),
              pods.map(pod => (
                <Link
                  key={pod.getId()}
                  to={getDetailsUrl(pod.selfLink)}
                  onClick={stopPropagation}
                >
                  {pod.getName()}
                </Link>
              )),
              <KubeObjectAge key="age" object={pvc} />,
              { title: pvc.getStatus(), className: pvc.getStatus().toLowerCase() },
            ];
          }}
        />
      </SiblingsInTabLayout>
    );
  }
}
