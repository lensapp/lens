/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-claims.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { unitsToBytes } from "../../../common/utils/convertMemory";
import { prevDefault, stopPropagation } from "../../utils";
import type { StorageClassApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { PersistentVolumeClaimStore } from "./store";
import type { PodStore } from "../+workloads-pods/store";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import type { FilterByNamespace } from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import filterByNamespaceInjectable from "../+namespaces/namespace-select-filter-model/filter-by-namespace.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import persistentVolumeClaimStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
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

interface Dependencies {
  persistentVolumeClaimStore: PersistentVolumeClaimStore;
  storageClassApi: StorageClassApi;
  podStore: PodStore;
  getDetailsUrl: GetDetailsUrl;
  filterByNamespace: FilterByNamespace;
}

@observer
class NonInjectedPersistentVolumeClaims extends React.Component<Dependencies> {
  render() {
    const {
      persistentVolumeClaimStore,
      filterByNamespace,
      getDetailsUrl,
      podStore,
      storageClassApi,
    } = this.props;

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
            const storageClassDetailsUrl = getDetailsUrl(storageClassApi.formatUrlForNotListing({
              name: storageClassName,
            }));

            return [
              pvc.getName(),
              <KubeObjectStatusIcon key="icon" object={pvc} />,
              <a
                key="namespace"
                className="filterNamespace"
                onClick={prevDefault(() => filterByNamespace(pvc.getNs()))}
              >
                {pvc.getNs()}
              </a>,
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

export const PersistentVolumeClaims = withInjectables<Dependencies>(NonInjectedPersistentVolumeClaims, {
  getProps: (di, props) => ({
    ...props,
    filterByNamespace: di.inject(filterByNamespaceInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    persistentVolumeClaimStore: di.inject(persistentVolumeClaimStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    storageClassApi: di.inject(storageClassApiInjectable),
  }),
});
