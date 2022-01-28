/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-claims.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import type { PodStore } from "../+pods/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { unitsToBytes } from "../../../common/utils/convertMemory";
import { stopPropagation } from "../../utils";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { VolumeClaimsRouteParams } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PersistentVolumeClaimStore } from "./store";
import type { StorageClassApi } from "../../../common/k8s-api/endpoints";
import podStoreInjectable from "../+pods/store.injectable";
import persistentVolumeClaimStoreInjectable from "./store.injectable";
import storageClassApiInjectable from "../../../common/k8s-api/endpoints/storage-class.api.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  size = "size",
  storageClass = "storage-class",
  status = "status",
  age = "age",
}

export interface PersistentVolumeClaimsProps extends RouteComponentProps<VolumeClaimsRouteParams> {
}

interface Dependencies {
  podStore: PodStore;
  persistentVolumeClaimStore: PersistentVolumeClaimStore;
  storageClassApi: StorageClassApi;
}

const NonInjectedPersistentVolumeClaims = observer(({ podStore, persistentVolumeClaimStore, storageClassApi }: Dependencies & PersistentVolumeClaimsProps) => (
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
      [columnId.age]: pvc => pvc.getTimeDiffFromNow(),
    }}
    searchFilters={[
      item => item.getSearchFields(),
      item => item.getPods(podStore.items).map(pod => pod.getName()),
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
        <Link key="link" to={storageClassDetailsUrl} onClick={stopPropagation}>
          {storageClassName}
        </Link>,
        pvc.getStorage(),
        pods.map(pod => (
          <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)} onClick={stopPropagation}>
            {pod.getName()}
          </Link>
        )),
        pvc.getAge(),
        { title: pvc.getStatus(), className: pvc.getStatus().toLowerCase() },
      ];
    }}
  />
));

export const PersistentVolumeClaims = withInjectables<Dependencies, PersistentVolumeClaimsProps>(NonInjectedPersistentVolumeClaims, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    persistentVolumeClaimStore: di.inject(persistentVolumeClaimStoreInjectable),
    storageClassApi: di.inject(storageClassApiInjectable),
    ...props,
  }),
});

