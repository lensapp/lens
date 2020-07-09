import "./volume-claims.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { volumeClaimStore } from "./volume-claim.store";
import { PersistentVolumeClaim, pvcApi } from "../../api/endpoints/persistent-volume-claims.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectListLayout } from "../kube-object";
import { VolumeClaimsRouteParams } from "./volume-claims.route";
import { unitsToBytes } from "../../utils/convertMemory";
import { stopPropagation } from "../../utils";
import { getDetailsUrl } from "../../navigation";
import { storageClassApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  size = "size",
  storageClass = "storage-class",
  status = "status",
  age = "age",
}

interface Props extends RouteComponentProps<VolumeClaimsRouteParams> {
}

@observer
export class PersistentVolumeClaims extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="PersistentVolumeClaims"
        store={volumeClaimStore}
        dependentStores={[podsStore]}
        sortingCallbacks={{
          [sortBy.name]: (pvc: PersistentVolumeClaim): string => pvc.getName(),
          [sortBy.namespace]: (pvc: PersistentVolumeClaim): string => pvc.getNs(),
          [sortBy.pods]: (pvc: PersistentVolumeClaim): string[] => pvc.getPods(podsStore.items).map(pod => pod.getName()),
          [sortBy.status]: (pvc: PersistentVolumeClaim): string => pvc.getStatus(),
          [sortBy.size]: (pvc: PersistentVolumeClaim): number => unitsToBytes(pvc.getStorage()),
          [sortBy.storageClass]: (pvc: PersistentVolumeClaim): string => pvc.spec.storageClassName,
          [sortBy.age]: (pvc: PersistentVolumeClaim): string => pvc.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PersistentVolumeClaim): string[] => item.getSearchFields(),
          (item: PersistentVolumeClaim): string[] => item.getPods(podsStore.items).map(pod => pod.getName()),
        ]}
        renderHeaderTitle={<Trans>Persistent Volume Claims</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Storage class</Trans>, className: "storageClass", sortBy: sortBy.storageClass },
          { title: <Trans>Size</Trans>, className: "size", sortBy: sortBy.size },
          { title: <Trans>Pods</Trans>, className: "pods", sortBy: sortBy.pods },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
        ]}
        renderTableContents={(pvc: PersistentVolumeClaim): (string | number | JSX.Element | JSX.Element[] | React.ReactNode)[] => {
          const pods = pvc.getPods(podsStore.items);
          const { storageClassName } = pvc.spec;
          const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
            name: storageClassName
          }));
          return [
            pvc.getName(),
            pvc.getNs(),
            <Link key="storageClass" to={storageClassDetailsUrl} onClick={stopPropagation}>
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
        renderItemMenu={(item: PersistentVolumeClaim): JSX.Element => {
          return <PersistentVolumeClaimMenu object={item}/>;
        }}
      />
    );
  }
}

export function PersistentVolumeClaimMenu(props: KubeObjectMenuProps<PersistentVolumeClaim>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(pvcApi, {
  Menu: PersistentVolumeClaimMenu,
});
