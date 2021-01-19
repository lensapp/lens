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

enum sortBy {
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
        className="PersistentVolumeClaims"
        store={volumeClaimStore}
        dependentStores={[podsStore]}
        sortingCallbacks={{
          [sortBy.name]: (pvc: PersistentVolumeClaim) => pvc.getName(),
          [sortBy.namespace]: (pvc: PersistentVolumeClaim) => pvc.getNs(),
          [sortBy.pods]: (pvc: PersistentVolumeClaim) => pvc.getPods(podsStore.items).map(pod => pod.getName()),
          [sortBy.status]: (pvc: PersistentVolumeClaim) => pvc.getStatus(),
          [sortBy.size]: (pvc: PersistentVolumeClaim) => unitsToBytes(pvc.getStorage()),
          [sortBy.storageClass]: (pvc: PersistentVolumeClaim) => pvc.spec.storageClassName,
          [sortBy.age]: (pvc: PersistentVolumeClaim) => pvc.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PersistentVolumeClaim) => item.getSearchFields(),
          (item: PersistentVolumeClaim) => item.getPods(podsStore.items).map(pod => pod.getName()),
        ]}
        renderHeaderTitle="Persistent Volume Claims"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Storage class", className: "storageClass", sortBy: sortBy.storageClass },
          { title: "Size", className: "size", sortBy: sortBy.size },
          { title: "Pods", className: "pods", sortBy: sortBy.pods },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Status", className: "status", sortBy: sortBy.status },
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
