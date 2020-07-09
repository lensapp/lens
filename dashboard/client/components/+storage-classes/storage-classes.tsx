import "./storage-classes.scss";

import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { StorageClass, storageClassApi } from "../../api/endpoints/storage-class.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { StorageClassesRouteParams } from "./storage-classes.route";
import { storageClassStore } from "./storage-class.store";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  age = "age",
  provisioner = "provision",
  reclaimPolicy = "reclaim",
}

interface Props extends RouteComponentProps<StorageClassesRouteParams> {
}

@observer
export class StorageClasses extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="StorageClasses"
        store={storageClassStore} isClusterScoped
        sortingCallbacks={{
          [sortBy.name]: (item: StorageClass): string => item.getName(),
          [sortBy.age]: (item: StorageClass): string => item.metadata.creationTimestamp,
          [sortBy.provisioner]: (item: StorageClass): string => item.provisioner,
          [sortBy.reclaimPolicy]: (item: StorageClass): string => item.reclaimPolicy,
        }}
        searchFilters={[
          (item: StorageClass): string[] => item.getSearchFields(),
          (item: StorageClass): string => item.provisioner,
        ]}
        renderHeaderTitle={<Trans>Storage Classes</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Provisioner</Trans>, className: "provisioner", sortBy: sortBy.provisioner },
          { title: <Trans>Reclaim Policy</Trans>, className: "reclaim-policy", sortBy: sortBy.reclaimPolicy },
          { title: <Trans>Default</Trans>, className: "is-default" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(storageClass: StorageClass): (string | JSX.Element | number)[] => [
          storageClass.getName(),
          storageClass.provisioner,
          storageClass.getReclaimPolicy(),
          storageClass.isDefault() ? <Trans>Yes</Trans> : null,
          storageClass.getAge(),
        ]}
        renderItemMenu={(item: StorageClass): JSX.Element => {
          return <StorageClassMenu object={item}/>;
        }}
      />
    );
  }
}

export function StorageClassMenu(props: KubeObjectMenuProps<StorageClass>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(storageClassApi, {
  Menu: StorageClassMenu,
});
