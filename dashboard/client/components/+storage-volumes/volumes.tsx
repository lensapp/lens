import "./volumes.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Link, RouteComponentProps } from "react-router-dom";
import { PersistentVolume, persistentVolumeApi } from "../../api/endpoints/persistent-volume.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { VolumesRouteParams } from "./volumes.route";
import { stopPropagation } from "../../utils";
import { getDetailsUrl } from "../../navigation";
import { volumesStore } from "./volumes.store";
import { pvcApi, storageClassApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  storageClass = "storage-class",
  capacity = "capacity",
  status = "status",
  age = "age",
}

interface Props extends RouteComponentProps<VolumesRouteParams> {
}

@observer
export class PersistentVolumes extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="PersistentVolumes"
        store={volumesStore} isClusterScoped
        sortingCallbacks={{
          [sortBy.name]: (item: PersistentVolume): string => item.getName(),
          [sortBy.storageClass]: (item: PersistentVolume): string => item.spec.storageClassName,
          [sortBy.capacity]: (item: PersistentVolume): string | number => item.getCapacity(true),
          [sortBy.status]: (item: PersistentVolume): string => item.getStatus(),
          [sortBy.age]: (item: PersistentVolume): string => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PersistentVolume): string[] => item.getSearchFields(),
          (item: PersistentVolume): string => item.getClaimRefName(),
        ]}
        renderHeaderTitle={<Trans>Persistent Volumes</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Storage Class</Trans>, className: "storageClass", sortBy: sortBy.storageClass },
          { title: <Trans>Capacity</Trans>, className: "capacity", sortBy: sortBy.capacity },
          { title: <Trans>Claim</Trans>, className: "claim" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
        ]}
        renderTableContents={(volume: PersistentVolume): (string | number | JSX.Element | React.ReactNode)[] => {
          const { claimRef, storageClassName } = volume.spec;
          const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
            name: storageClassName
          }));
          return [
            volume.getName(),
            <Link key="storageClass" to={storageClassDetailsUrl} onClick={stopPropagation}>
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
        renderItemMenu={(item: PersistentVolume): JSX.Element => {
          return <PersistentVolumeMenu object={item}/>;
        }}
      />
    );
  }
}

export function PersistentVolumeMenu(props: KubeObjectMenuProps<PersistentVolume>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(persistentVolumeApi, {
  Menu: PersistentVolumeMenu,
});
