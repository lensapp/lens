import "./storage-classes.scss";

import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { StorageClass, storageClassApi } from "../../api/endpoints/storage-class.api";
import { KubeObjectListLayout } from "../kube-object";
import { IStorageClassesRouteParams } from "./storage-classes.route";
import { storageClassStore } from "./storage-class.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  age = "age",
  provisioner = "provision",
  reclaimPolicy = "reclaim",
}

interface Props extends RouteComponentProps<IStorageClassesRouteParams> {
}

@observer
export class StorageClasses extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="StorageClasses"
        store={storageClassStore} isClusterScoped
        sortingCallbacks={{
          [sortBy.name]: (item: StorageClass) => item.getName(),
          [sortBy.age]: (item: StorageClass) => item.metadata.creationTimestamp,
          [sortBy.provisioner]: (item: StorageClass) => item.provisioner,
          [sortBy.reclaimPolicy]: (item: StorageClass) => item.reclaimPolicy,
        }}
        searchFilters={[
          (item: StorageClass) => item.getSearchFields(),
          (item: StorageClass) => item.provisioner,
        ]}
        renderHeaderTitle={<Trans>Storage Classes</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: <Trans>Provisioner</Trans>, className: "provisioner", sortBy: sortBy.provisioner },
          { title: <Trans>Reclaim Policy</Trans>, className: "reclaim-policy", sortBy: sortBy.reclaimPolicy },
          { title: <Trans>Default</Trans>, className: "is-default" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(storageClass: StorageClass) => [
          storageClass.getName(),
          <KubeObjectStatusIcon object={storageClass} />,
          storageClass.provisioner,
          storageClass.getReclaimPolicy(),
          storageClass.isDefault() ? <Trans>Yes</Trans> : null,
          storageClass.getAge(),
        ]}
      />
    );
  }
}
