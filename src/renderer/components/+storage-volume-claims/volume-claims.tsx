import "./volume-claims.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import { volumeClaimStore } from "./volume-claim.store";
import { PersistentVolumeClaim } from "../../api/endpoints/persistent-volume-claims.api";
import { podsStore } from "../+workloads-pods/pods.store";
import { getDetailsUrl, KubeObjectListLayout } from "../kube-object";
import { IVolumeClaimsRouteParams } from "./volume-claims.route";
import { unitsToBytes } from "../../utils/convertMemory";
import { stopPropagation } from "../../utils";
import { storageClassApi } from "../../api/endpoints";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  size = "size",
  storageClass = "storage-class",
  status = "status",
  age = "age",
}

interface Props extends RouteComponentProps<IVolumeClaimsRouteParams> {
}

@observer
export class PersistentVolumeClaims extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="storage_volume_claims"
        className="PersistentVolumeClaims"
        store={volumeClaimStore}
        dependentStores={[podsStore]}
        sortingCallbacks={{
          [columnId.name]: (pvc: PersistentVolumeClaim) => pvc.getName(),
          [columnId.namespace]: (pvc: PersistentVolumeClaim) => pvc.getNs(),
          [columnId.pods]: (pvc: PersistentVolumeClaim) => pvc.getPods(podsStore.items).map(pod => pod.getName()),
          [columnId.status]: (pvc: PersistentVolumeClaim) => pvc.getStatus(),
          [columnId.size]: (pvc: PersistentVolumeClaim) => unitsToBytes(pvc.getStorage()),
          [columnId.storageClass]: (pvc: PersistentVolumeClaim) => pvc.spec.storageClassName,
          [columnId.age]: (pvc: PersistentVolumeClaim) => pvc.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (item: PersistentVolumeClaim) => item.getSearchFields(),
          (item: PersistentVolumeClaim) => item.getPods(podsStore.items).map(pod => pod.getName()),
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
        renderTableContents={(pvc: PersistentVolumeClaim) => {
          const pods = pvc.getPods(podsStore.items);
          const { storageClassName } = pvc.spec;
          const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
            name: storageClassName
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
    );
  }
}
